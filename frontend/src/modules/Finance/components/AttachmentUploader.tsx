import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Upload, notification } from 'antd';
import { Paperclip, Trash2 } from 'lucide-react';
import { attachmentsService, type AttachmentDTO } from '../services/attachments.service';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB — mesmo limite do backend
const ACCEPT = '.pdf,.jpg,.jpeg,.png,.docx,.xlsx';

export interface AttachmentUploaderHandle {
  /** Envia os arquivos escolhidos antes de existir um registro (ex: nova transação) assim que o id existir. */
  uploadPending: (target: { transactionId?: string; personId?: string }) => Promise<void>;
  hasPending: () => boolean;
}

interface Props {
  transactionId?: string;
  category?: string;
}

export const AttachmentUploader = forwardRef<AttachmentUploaderHandle, Props>(function AttachmentUploader(
  { transactionId, category = 'COMPROVANTE' },
  ref,
) {
  const [attachments, setAttachments] = useState<AttachmentDTO[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!transactionId) return;
    attachmentsService.list({ transactionId }).then(setAttachments).catch(() => {});
  }, [transactionId]);

  useImperativeHandle(ref, () => ({
    hasPending: () => pendingFiles.length > 0,
    async uploadPending(target) {
      for (const file of pendingFiles) {
        await attachmentsService.upload(file, { ...target, category });
      }
      setPendingFiles([]);
    },
  }));

  const beforeUpload = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      notification.warning({ message: 'Arquivo muito grande (máx 20 MB).' });
      return Upload.LIST_IGNORE;
    }

    if (transactionId) {
      setUploading(true);
      try {
        const attachment = await attachmentsService.upload(file, { transactionId, category });
        setAttachments((prev) => [attachment, ...prev]);
      } catch {
        notification.error({ message: 'Erro', description: 'Não foi possível enviar o arquivo.' });
      } finally {
        setUploading(false);
      }
    } else {
      setPendingFiles((prev) => [...prev, file]);
    }
    return false;
  };

  const removeSaved = async (attachment: AttachmentDTO) => {
    try {
      await attachmentsService.remove(attachment.id);
      setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
    } catch {
      notification.error({ message: 'Erro', description: 'Não foi possível remover o anexo.' });
    }
  };

  const openAttachment = async (attachment: AttachmentDTO) => {
    try {
      const { url } = await attachmentsService.getDownloadUrl(attachment.id);
      window.open(url, '_blank', 'noopener');
    } catch {
      notification.error({ message: 'Erro', description: 'Não foi possível abrir o anexo.' });
    }
  };

  return (
    <div>
      <Upload beforeUpload={beforeUpload} showUploadList={false} multiple accept={ACCEPT} disabled={uploading}>
        <Button icon={<Paperclip size={15} />} loading={uploading} className="rounded-xl">
          Selecionar arquivo
        </Button>
      </Upload>

      {(attachments.length > 0 || pendingFiles.length > 0) && (
        <div className="mt-3 space-y-2">
          {attachments.map((a) => (
            <div key={a.id} className="flex items-center gap-3 bg-dark-50 border border-dark-100 rounded-xl px-4 py-2.5">
              <Paperclip size={13} className="text-dark-400 shrink-0" />
              <button
                type="button"
                onClick={() => openAttachment(a)}
                className="flex-1 text-left text-sm font-bold text-dark-700 truncate hover:underline"
              >
                {a.fileName}
              </button>
              <span className="text-xs text-dark-400 shrink-0">{(a.sizeBytes / 1024).toFixed(0)} KB</span>
              <button type="button" onClick={() => removeSaved(a)}>
                <Trash2 size={14} className="text-dark-300 hover:text-red-500 transition-colors" />
              </button>
            </div>
          ))}
          {pendingFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-dark-50 border border-dark-100 rounded-xl px-4 py-2.5">
              <Paperclip size={13} className="text-dark-400 shrink-0" />
              <span className="flex-1 text-sm font-bold text-dark-700 truncate">{f.name}</span>
              <span className="text-xs text-dark-400 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
              <button type="button" onClick={() => setPendingFiles((prev) => prev.filter((_, j) => j !== i))}>
                <Trash2 size={14} className="text-dark-300 hover:text-red-500 transition-colors" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

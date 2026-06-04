import { useState, useEffect } from 'react';
import { Modal, Button, Select, Switch, Avatar } from 'antd';
import { Shuffle } from 'lucide-react';
import {
  type AvatarOptions,
  DEFAULT_AVATAR_OPTIONS,
  SKIN_COLORS,
  TOP_STYLES,
  HAIR_COLORS,
  EYES_STYLES,
  EYEBROWS_STYLES,
  MOUTH_STYLES,
  CLOTHING_TYPES,
  CLOTHING_COLORS,
  ACCESSORIES_TYPES,
  FACIAL_HAIR_TYPES,
  BACKGROUND_COLORS,
  getAvatarUrl,
} from '../utils/avatar';

interface Props {
  open: boolean;
  currentConfig: string | null | undefined;
  userSeed: string;
  onClose: () => void;
  onSave: (config: string) => Promise<void>;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function parseConfig(config: string | null | undefined): { options: AvatarOptions; withAccessories: boolean; withFacialHair: boolean } {
  if (config) {
    try {
      const parsed = JSON.parse(config) as AvatarOptions;
      return {
        options: parsed,
        withAccessories: (parsed.accessoriesProbability ?? 0) > 0,
        withFacialHair: (parsed.facialHairProbability ?? 0) > 0,
      };
    } catch { /* fall through */ }
  }
  return { options: { ...DEFAULT_AVATAR_OPTIONS }, withAccessories: false, withFacialHair: false };
}

interface SwatchProps {
  colors: { value: string; hex: string }[];
  selected?: string;
  onSelect: (v: string) => void;
}

function ColorSwatches({ colors, selected, onSelect }: SwatchProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <button
          key={c.value}
          title={c.value}
          onClick={() => onSelect(c.value)}
          className={`w-7 h-7 rounded-full border-2 transition-all ${
            selected === c.value
              ? 'border-primary-600 scale-110 shadow-md'
              : 'border-dark-100 hover:border-dark-400'
          }`}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold text-dark-400 uppercase tracking-widest mb-2">{children}</p>;
}

export default function AvatarEditor({ open, currentConfig, userSeed, onClose, onSave }: Props) {
  const [options, setOptions] = useState<AvatarOptions>({ ...DEFAULT_AVATAR_OPTIONS });
  const [withAccessories, setWithAccessories] = useState(false);
  const [withFacialHair, setWithFacialHair] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const parsed = parseConfig(currentConfig);
      setOptions(parsed.options);
      setWithAccessories(parsed.withAccessories);
      setWithFacialHair(parsed.withFacialHair);
    }
  }, [open, currentConfig]);

  const setOpt = <K extends keyof AvatarOptions>(key: K, value: AvatarOptions[K]) =>
    setOptions((prev) => ({ ...prev, [key]: value }));

  const previewOptions: AvatarOptions = {
    ...options,
    accessoriesProbability: withAccessories ? 100 : 0,
    accessories: withAccessories ? (options.accessories || ACCESSORIES_TYPES[0].value) : undefined,
    facialHairProbability: withFacialHair ? 100 : 0,
    facialHair: withFacialHair ? (options.facialHair || FACIAL_HAIR_TYPES[0].value) : undefined,
  };

  const previewUrl = getAvatarUrl(JSON.stringify(previewOptions), userSeed);

  const handleRandomize = () => {
    const rAccessories = Math.random() > 0.6;
    const rFacialHair = Math.random() > 0.6;
    setWithAccessories(rAccessories);
    setWithFacialHair(rFacialHair);
    setOptions({
      skinColor: pickRandom(SKIN_COLORS).value,
      top: pickRandom(TOP_STYLES).value,
      hairColor: pickRandom(HAIR_COLORS).value,
      eyes: pickRandom(EYES_STYLES).value,
      eyebrows: pickRandom(EYEBROWS_STYLES).value,
      mouth: pickRandom(MOUTH_STYLES).value,
      clothing: pickRandom(CLOTHING_TYPES).value,
      clothesColor: pickRandom(CLOTHING_COLORS).value,
      accessories: rAccessories ? pickRandom(ACCESSORIES_TYPES).value : undefined,
      accessoriesProbability: rAccessories ? 100 : 0,
      facialHair: rFacialHair ? pickRandom(FACIAL_HAIR_TYPES).value : undefined,
      facialHairProbability: rFacialHair ? 100 : 0,
      backgroundColor: pickRandom(BACKGROUND_COLORS).value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(JSON.stringify(previewOptions));
      onClose();
    } catch {
      // error notification is shown by the onSave handler (UserProfile)
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={<span className="font-bold text-dark-900 text-lg">Personalizar Avatar</span>}
      width={520}
      destroyOnClose
    >
      {/* Live preview */}
      <div className="flex flex-col items-center py-5 border-b border-dark-100 mb-5">
        <Avatar
          size={110}
          src={previewUrl}
          className="border-4 border-white shadow-lg bg-primary-50 mb-3"
        />
        <Button
          onClick={handleRandomize}
          icon={<Shuffle size={15} />}
          className="rounded-xl font-bold"
          size="small"
        >
          Randomizar
        </Button>
      </div>

      <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">

        {/* Pele */}
        <div>
          <SectionLabel>Pele</SectionLabel>
          <ColorSwatches
            colors={SKIN_COLORS}
            selected={options.skinColor}
            onSelect={(v) => setOpt('skinColor', v)}
          />
        </div>

        {/* Cabelo */}
        <div>
          <SectionLabel>Cabelo</SectionLabel>
          <Select
            value={options.top}
            onChange={(v) => setOpt('top', v)}
            size="middle"
            className="w-full mb-2"
            options={TOP_STYLES.map((s) => ({ value: s.value, label: s.label }))}
            showSearch
            optionFilterProp="label"
          />
          <ColorSwatches
            colors={HAIR_COLORS}
            selected={options.hairColor}
            onSelect={(v) => setOpt('hairColor', v)}
          />
        </div>

        {/* Expressão */}
        <div>
          <SectionLabel>Expressão</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-dark-500 mb-1">Olhos</p>
              <Select
                value={options.eyes}
                onChange={(v) => setOpt('eyes', v)}
                size="middle"
                className="w-full"
                options={EYES_STYLES.map((s) => ({ value: s.value, label: s.label }))}
              />
            </div>
            <div>
              <p className="text-xs text-dark-500 mb-1">Sobrancelhas</p>
              <Select
                value={options.eyebrows}
                onChange={(v) => setOpt('eyebrows', v)}
                size="middle"
                className="w-full"
                options={EYEBROWS_STYLES.map((s) => ({ value: s.value, label: s.label }))}
              />
            </div>
            <div className="col-span-2">
              <p className="text-xs text-dark-500 mb-1">Boca</p>
              <Select
                value={options.mouth}
                onChange={(v) => setOpt('mouth', v)}
                size="middle"
                className="w-full"
                options={MOUTH_STYLES.map((s) => ({ value: s.value, label: s.label }))}
              />
            </div>
          </div>
        </div>

        {/* Roupa */}
        <div>
          <SectionLabel>Roupa</SectionLabel>
          <Select
            value={options.clothing}
            onChange={(v) => setOpt('clothing', v)}
            size="middle"
            className="w-full mb-2"
            options={CLOTHING_TYPES.map((s) => ({ value: s.value, label: s.label }))}
          />
          <ColorSwatches
            colors={CLOTHING_COLORS}
            selected={options.clothesColor}
            onSelect={(v) => setOpt('clothesColor', v)}
          />
        </div>

        {/* Acessórios */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Acessórios</SectionLabel>
            <Switch size="small" checked={withAccessories} onChange={setWithAccessories} />
          </div>
          {withAccessories && (
            <Select
              value={options.accessories}
              onChange={(v) => setOpt('accessories', v)}
              size="middle"
              className="w-full"
              placeholder="Escolha o tipo"
              options={ACCESSORIES_TYPES.map((s) => ({ value: s.value, label: s.label }))}
            />
          )}
        </div>

        {/* Barba / Bigode */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Barba / Bigode</SectionLabel>
            <Switch size="small" checked={withFacialHair} onChange={setWithFacialHair} />
          </div>
          {withFacialHair && (
            <Select
              value={options.facialHair}
              onChange={(v) => setOpt('facialHair', v)}
              size="middle"
              className="w-full"
              placeholder="Escolha o estilo"
              options={FACIAL_HAIR_TYPES.map((s) => ({ value: s.value, label: s.label }))}
            />
          )}
        </div>

        {/* Fundo */}
        <div>
          <SectionLabel>Cor de Fundo</SectionLabel>
          <ColorSwatches
            colors={BACKGROUND_COLORS}
            selected={options.backgroundColor}
            onSelect={(v) => setOpt('backgroundColor', v)}
          />
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 mt-5">
        <Button onClick={onClose} className="rounded-xl">Cancelar</Button>
        <Button
          type="primary"
          loading={isSaving}
          onClick={handleSave}
          className="bg-dark-900 hover:!bg-dark-800 border-none rounded-xl font-bold px-6"
        >
          Salvar Avatar
        </Button>
      </div>
    </Modal>
  );
}

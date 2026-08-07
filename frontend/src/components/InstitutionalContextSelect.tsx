import { useEffect, useState } from 'react';
import { Select, type SelectProps } from 'antd';
import { institutionalContextsService } from '../modules/InstitutionalContexts/services/institutional-contexts.service';

export function InstitutionalContextSelect(props: SelectProps) {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    institutionalContextsService.list({ status: 'ACTIVE' })
      .then((items) => setOptions(items.map((item) => ({ value: item.id, label: item.name }))))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Select
      allowClear
      showSearch
      optionFilterProp="label"
      placeholder="Nenhum contexto institucional"
      options={options}
      loading={loading}
      {...props}
    />
  );
}


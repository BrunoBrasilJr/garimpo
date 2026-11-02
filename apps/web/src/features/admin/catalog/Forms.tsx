import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react';
import { ClientError, readableError } from '../../account/client';

const Fields = createContext<Record<string, string[]>>({});
export function ActionForm({ title, submit, onSubmit, children, reset = false }: {
  title: string; submit: string; onSubmit: (data: FormData) => Promise<void>; children?: ReactNode; reset?: boolean;
}) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [fields, setFields] = useState<Record<string, string[]>>({});
  const submitting = useRef(false), alert = useRef<HTMLDivElement>(null);
  useEffect(() => { if (error) alert.current?.focus(); }, [error]);
  async function handle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (submitting.current) return;
    const form = event.currentTarget, data = new FormData(form);
    submitting.current = true; setBusy(true); setError(''); setFields({});
    try { await onSubmit(data); if (reset) form.reset(); }
    catch (cause) { setError(readableError(cause)); setFields(cause instanceof ClientError ? cause.fields : {}); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <form aria-label={title} onSubmit={handle} className="catalog-form" aria-busy={busy}>
    <h3>{title}</h3>{error ? <div ref={alert} tabIndex={-1} role="alert" className="account-error">{error}</div> : null}
    <Fields.Provider value={fields}><fieldset disabled={busy}>{children}</fieldset></Fields.Provider>
    <button type="submit" disabled={busy}>{busy ? 'Aguarde…' : submit}</button>
  </form>;
}
export function Input({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const id = useId(), fields = useContext(Fields), invalid = Boolean(props.name && Object.keys(fields).some(key => key === props.name || key.startsWith(props.name + '.')));
  return <div className="catalog-field"><label htmlFor={id}>{label}</label><input {...props} id={id} aria-invalid={invalid} aria-describedby={hint ? id + '-hint' : undefined} />{hint ? <small id={id + '-hint'}>{hint}</small> : null}</div>;
}
export function Select({ label, name, options, value, multiple = false, required = true }: {
  label: string; name: string; options: { value: string; label: string }[]; value?: string | string[] | undefined; multiple?: boolean; required?: boolean;
}) {
  const id = useId(), fields = useContext(Fields);
  return <div className="catalog-field"><label htmlFor={id}>{label}</label><select id={id} name={name} defaultValue={value} multiple={multiple} required={required}
    size={multiple ? Math.min(5, Math.max(2, options.length)) : undefined} aria-invalid={Boolean(fields[name])}>
    {!multiple && !required ? <option value="">Não informado</option> : null}{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
  </select>{multiple ? <small>Selecione uma ou mais opções; no teclado, use Ctrl ou Command para combinar.</small> : null}</div>;
}
export const value = (data: FormData, name: string) => String(data.get(name) ?? '').trim();
export const optional = (data: FormData, name: string) => value(data, name) || null;
export const numberOrNull = (data: FormData, name: string) => value(data, name) ? Number(value(data, name)) : null;

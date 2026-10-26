import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react';
import { ClientError, readableError } from './client';

export interface Field { name: string; label: string; type?: string; autoComplete?: string; value?: string; hint?: string; required?: boolean; pattern?: string; inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'] }
export function Form({ title, fields, submit, onSubmit, children }: {
  title: string; fields: Field[]; submit: string; onSubmit: (values: Record<string, string>) => Promise<void>; children?: ReactNode
}) {
  const id = useId(), alert = useRef<HTMLDivElement>(null), submitting = useRef(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState<{ message: string } | null>(null), [errors, setErrors] = useState<Record<string, string[]>>({});
  useEffect(() => { if (error) alert.current?.focus(); }, [error]);
  async function handle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (submitting.current) return;
    const form = event.currentTarget, values = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    submitting.current = true; setBusy(true); setError(null); setErrors({});
    try {
      for (const field of ['password', 'newPassword']) if (values[field] !== undefined && fields.find(item => item.name === field)?.autoComplete === 'new-password') {
        const length = Array.from(values[field]!).length;
        if (length < 15 || length > 128) throw new ClientError(422, 'INVALID_INPUT', 'Use uma senha entre 15 e 128 caracteres.', { [field]: ['Use entre 15 e 128 caracteres.'] });
      }
      await onSubmit(values);
      form.reset();
    } catch (cause) {
      setError({ message: readableError(cause) }); setErrors(cause instanceof ClientError ? cause.fields : {});
    } finally {
      for (const field of ['password', 'newPassword']) { const input = form.elements.namedItem(field); if (input instanceof HTMLInputElement) input.value = ''; }
      submitting.current = false; setBusy(false);
    }
  }
  return <form aria-label={title} onSubmit={handle} className="account-form" aria-busy={busy}>
    <h2>{title}</h2>
    {error ? <div ref={alert} role="alert" tabIndex={-1} className="account-error">{error.message}</div> : null}
    {fields.map(field => <div className="account-field" key={field.name}>
      <label htmlFor={id + field.name}>{field.label}</label>
      <input id={id + field.name} name={field.name} type={field.type ?? 'text'} autoComplete={field.autoComplete ?? 'off'} defaultValue={field.value ?? ''}
        required={field.required !== false} disabled={busy} pattern={field.pattern} inputMode={field.inputMode}
        aria-invalid={Boolean(errors[field.name])} aria-describedby={field.hint || errors[field.name] ? id + field.name + '-hint' : undefined} />
      {field.hint || errors[field.name] ? <small id={id + field.name + '-hint'}>{errors[field.name]?.join(' ') ?? field.hint}</small> : null}
    </div>)}
    {children ? <fieldset className="account-extra" disabled={busy}>{children}</fieldset> : null}
    <button type="submit" disabled={busy}>{busy ? 'Aguarde…' : submit}</button>
  </form>;
}

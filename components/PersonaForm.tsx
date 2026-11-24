import React from 'react';
import { PersonaDraft, PersonaField } from '../types';
import { PERSONA_FIELDS } from '../constants';
import { Input } from './Input';
import { Textarea } from './Textarea';

interface PersonaFormProps {
  personaDraft: PersonaDraft;
  onUpdatePersonaDraft: (updatedDraft: PersonaDraft) => void;
  disabled?: boolean;
}

/** The persona sheet in the four groups it was designed around; counts follow PERSONA_FIELDS order. */
const SECTIONS = [
  { title: 'Who they are', hint: 'Name, origin and habitat', count: 5 },
  { title: 'How they think', hint: 'Worldview, values and reasoning', count: 5 },
  { title: 'How they behave', hint: 'Quirks, voice and manner', count: 4 },
  { title: 'On your problem', hint: 'Their view, their tests and what they refuse', count: 4 },
];

const PersonaForm: React.FC<PersonaFormProps> = ({ personaDraft, onUpdatePersonaDraft, disabled }) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof PersonaDraft
  ) => {
    onUpdatePersonaDraft({ ...personaDraft, [key]: e.target.value });
  };

  const renderField = (field: PersonaField) => {
    const value = String(personaDraft[field.key] || '');
    const label = field.label.replace('DESIGN_PROBLEM_DOMAIN', 'the design problem');
    if (field.isTextarea) {
      return (
        <Textarea
          key={field.key}
          label={label}
          name={field.key}
          value={value}
          onChange={(e) => handleChange(e, field.key as keyof PersonaDraft)}
          rows={2}
          autoExpand
          maxRows={8}
          disabled={disabled}
        />
      );
    }
    return (
      <Input
        key={field.key}
        label={label}
        name={field.key}
        value={value}
        onChange={(e) => handleChange(e, field.key as keyof PersonaDraft)}
        disabled={disabled}
      />
    );
  };

  let start = 0;
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {SECTIONS.map((section, index) => {
        const fields = PERSONA_FIELDS.slice(start, start + section.count);
        start += section.count;
        return (
          <details key={section.title} open={index === 0} className="group border-t border-line">
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 py-3 [&::-webkit-details-marker]:hidden">
              <span className="w-8 font-display text-lg italic text-accent-text">{['I', 'II', 'III', 'IV'][index]}</span>
              <span className="flex-1">
                <span className="block font-display text-xl text-ink">{section.title}</span>
                <span className="block text-sm text-muted">{section.hint}</span>
              </span>
              <span aria-hidden="true" className="text-xl text-muted transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="pb-4 pl-0 pt-2 md:pl-12">{fields.map(renderField)}</div>
          </details>
        );
      })}
    </form>
  );
};

export default PersonaForm;

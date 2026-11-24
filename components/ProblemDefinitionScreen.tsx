import React, { useState, useEffect } from 'react';
import { MAX_DESCRIPTION_LENGTH } from '../constants';
import { Textarea } from './Textarea';
import { Button } from './Button';

interface ProblemDefinitionScreenProps {
  onProblemDefined: (description: string) => void;
  initialDescription?: string | null;
}

const ProblemDefinitionScreen: React.FC<ProblemDefinitionScreenProps> = ({ onProblemDefined, initialDescription }) => {
  const [description, setDescription] = useState(initialDescription || '');
  const [descriptionError, setDescriptionError] = useState('');

  useEffect(() => {
    setDescription(initialDescription || '');
  }, [initialDescription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setDescriptionError('Write the problem before continuing.');
      return;
    }
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setDescriptionError(`Keep the problem to ${MAX_DESCRIPTION_LENGTH} characters or fewer.`);
      return;
    }
    setDescriptionError('');
    onProblemDefined(description.trim());
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 md:py-20">
      <p className="eyebrow">Step one</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.08] text-ink md:text-[56px]">
        What problem has your team run out of ideas for?
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
        Describe it in a paragraph. An eccentric stranger will then be invented to think about it in ways you would not.
      </p>

      <form onSubmit={handleSubmit} className="mt-10">
        <Textarea
          label="The design problem"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={MAX_DESCRIPTION_LENGTH}
          placeholder="How might we…"
          rows={5}
          autoExpand
          maxRows={12}
          error={descriptionError}
          className="!text-lg"
          wrapperClassName="!mb-2"
          required
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            {description.length} of {MAX_DESCRIPTION_LENGTH} characters · saved in this browser
          </p>
          <Button type="submit" variant="primary" size="lg">
            Next: create a persona
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProblemDefinitionScreen;

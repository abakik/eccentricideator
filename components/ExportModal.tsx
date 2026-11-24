import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Idea, Persona, DesignProblem } from '../types';
import { downloadCSV } from '../services/csvExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideas: Idea[]; 
  allIdeas: Idea[]; 
  persona: Persona;
  designProblem: DesignProblem;
}

type ExportScope = 'pinned' | 'all';

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, ideas, allIdeas, persona, designProblem }) => {
  const [includePersona, setIncludePersona] = useState(true);
  const [includeProblem, setIncludeProblem] = useState(true);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exportScope, setExportScope] = useState<ExportScope>('pinned');


  const handleExport = () => {
    const ideasToExport = exportScope === 'pinned' ? ideas.filter(i => i.pinned) : allIdeas;

    if (ideasToExport.length === 0) {
        alert("No ideas selected for export.");
        return;
    }

    if (exportFormat === 'csv') {
      downloadCSV(ideasToExport, includePersona ? persona : undefined, includeProblem ? designProblem : undefined);
    } else {
      const dataToExport = {
        ...(includeProblem && { designProblem }),
        ...(includePersona && { persona }),
        ideas: ideasToExport,
      };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'eccentric_ideator_export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    onClose();
  };

  const numPinned = ideas.filter(i => i.pinned).length;
  const numAll = allIdeas.length;


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export ideas" size="md">
      <div className="space-y-6 text-ink">
        <div>
            <p className="eyebrow mb-2">Ideas</p>
            <div className="flex space-x-4">
                <label className="flex min-h-11 items-center text-sm">
                    <input 
                        type="radio" 
                        name="exportScope" 
                        value="pinned" 
                        checked={exportScope === 'pinned'} 
                        onChange={() => setExportScope('pinned')}
                        className="mr-2 h-4 w-4 accent-[var(--accent-text)]"
                    />
                    Kept ideas ({numPinned})
                </label>
                <label className="flex min-h-11 items-center text-sm">
                    <input 
                        type="radio" 
                        name="exportScope" 
                        value="all" 
                        checked={exportScope === 'all'} 
                        onChange={() => setExportScope('all')}
                        className="mr-2 h-4 w-4 accent-[var(--accent-text)]"
                    />
                    All ideas ({numAll})
                </label>
            </div>
        </div>
        
        <div>
          <p className="eyebrow mb-2">Include</p>
          <div className="space-y-2">
            <label className="flex min-h-11 items-center text-sm">
              <input
                type="checkbox"
                checked={includePersona}
                onChange={(e) => setIncludePersona(e.target.checked)}
                className="mr-2 h-4 w-4 accent-[var(--accent-text)]"
              />
              The persona
            </label>
            <label className="flex min-h-11 items-center text-sm">
              <input
                type="checkbox"
                checked={includeProblem}
                onChange={(e) => setIncludeProblem(e.target.checked)}
                className="mr-2 h-4 w-4 accent-[var(--accent-text)]"
              />
              The problem statement
            </label>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-2">Format</p>
          <div className="flex space-x-4">
            <label className="flex min-h-11 items-center text-sm">
                <input 
                    type="radio" 
                    name="exportFormat" 
                    value="csv" 
                    checked={exportFormat === 'csv'} 
                    onChange={() => setExportFormat('csv')}
                    className="mr-2 h-4 w-4 accent-[var(--accent-text)]"
                />
                CSV
            </label>
            <label className="flex min-h-11 items-center text-sm">
                <input 
                    type="radio" 
                    name="exportFormat" 
                    value="json" 
                    checked={exportFormat === 'json'} 
                    onChange={() => setExportFormat('json')}
                    className="mr-2 h-4 w-4 accent-[var(--accent-text)]"
                />
                JSON
            </label>
           </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-3 border-t border-line pt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleExport} disabled={(exportScope === 'pinned' && numPinned === 0) || (exportScope === 'all' && numAll === 0)}>
          Download {(exportScope === 'pinned' ? numPinned : numAll)} {(exportScope === 'pinned' ? numPinned : numAll) === 1 ? 'Idea' : 'Ideas'}
        </Button>
      </div>
    </Modal>
  );
};
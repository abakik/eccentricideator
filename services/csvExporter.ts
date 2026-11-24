
import { Idea, Persona, DesignProblem } from '../types';

const escapeCsvCell = (cellData: string | number | boolean | undefined): string => {
  if (cellData === undefined || cellData === null) {
    return '';
  }
  const stringData = String(cellData);
  // If the string contains a comma, double quote, or newline, wrap it in double quotes
  // and escape any existing double quotes by doubling them.
  if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
    return `"${stringData.replace(/"/g, '""')}"`;
  }
  return stringData;
};

export const downloadCSV = (
  ideas: Idea[],
  persona?: Persona,
  designProblem?: DesignProblem
): void => {
  let csvContent = "data:text/csv;charset=utf-8,";

  // Optional: Add Design Problem metadata
  if (designProblem) {
    csvContent += "Design Problem Details\n";
    csvContent += `Description,${escapeCsvCell(designProblem.description)}\n\n`;
  }

  // Optional: Add Persona metadata
  if (persona) {
    csvContent += "Persona Details\n";
    csvContent += `Name/Alias,${escapeCsvCell(persona.nameAlias)}\n`;
    csvContent += `Archetype,${escapeCsvCell(persona.archetypeDefiningEssence)}\n`;
    csvContent += `Worldview,${escapeCsvCell(persona.coreBeliefSystemWorldview)}\n\n`;
    // Add more persona fields if desired
  }
  
  // Add Idea headers
  const headers = ["Idea ID", "Idea Text", "Rationale", "Pinned (Y/N)", "Note"];
  if (persona) headers.push("Persona Name");
  csvContent += headers.join(',') + "\r\n";

  // Add Idea data
  ideas.forEach(idea => {
    const row = [
      escapeCsvCell(idea.id),
      escapeCsvCell(idea.text),
      escapeCsvCell(idea.rationale),
      escapeCsvCell(idea.pinned ? 'Y' : 'N'),
      escapeCsvCell(idea.note),
    ];
    if (persona) row.push(escapeCsvCell(persona.nameAlias));
    csvContent += row.join(',') + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "eccentric_ideator_export.csv");
  document.body.appendChild(link); // Required for FF

  link.click();
  document.body.removeChild(link);
};
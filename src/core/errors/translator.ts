import type { TranslatedError } from "@/core/types";

/**
 * Traducteur d'erreurs. Aucune stack trace n'est jamais affichée à l'utilisateur.
 * Ajouter de nouveaux codes ici au fil des besoins — chaque erreur produit
 * un message compréhensible par une personne sans culture technique.
 */
const CATALOG: Record<string, TranslatedError> = {
  ENOENT: {
    title: "Le dossier du projet est introuvable",
    explanation:
      "Le dossier de votre projet n'a pas été trouvé à l'emplacement enregistré.",
    solution:
      "Vérifiez que votre projet existe toujours et que le dossier n'a pas été déplacé.",
    retryable: true,
  },
  EACCES: {
    title: "Accès refusé au dossier",
    explanation:
      "L'application n'a pas la permission de lire ou d'écrire dans ce dossier.",
    solution:
      "Choisissez un autre dossier ou vérifiez les permissions de celui-ci.",
    retryable: true,
  },
  UNKNOWN: {
    title: "Une erreur est survenue",
    explanation:
      "Nous n'avons pas pu terminer l'opération, mais rien n'a été cassé.",
    solution: "Réessayez dans un instant. Si le problème persiste, contactez le support.",
    retryable: true,
  },
};

export function translateError(codeOrError: unknown): TranslatedError {
  if (typeof codeOrError === "string" && CATALOG[codeOrError]) return CATALOG[codeOrError];
  if (codeOrError && typeof codeOrError === "object" && "code" in codeOrError) {
    const code = (codeOrError as { code?: string }).code;
    if (code && CATALOG[code]) return CATALOG[code];
  }
  return CATALOG.UNKNOWN;
}

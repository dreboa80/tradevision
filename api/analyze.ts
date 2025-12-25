// Ce fichier n'est plus utilisé car l'appel est passé en direct côté client
// pour garantir la compatibilité avec l'environnement de prévisualisation.
export default function handler(req: any, res: any) {
  res.status(200).json({ status: "deprecated" });
}

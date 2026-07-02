import type { Project, VersionBumpPreview, VersionChangeType } from "@/core/types";

function parse(v: string): [number, number, number] {
  const parts = v.split(".").map((n) => parseInt(n, 10));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

export const VersionService = {
  preview(project: Project, type: VersionChangeType): VersionBumpPreview {
    const [maj, min, pat] = parse(project.currentVersion);
    let to = project.currentVersion;
    switch (type) {
      case "bugfix":
        to = `${maj}.${min}.${pat + 1}`;
        break;
      case "feature":
        to = `${maj}.${min + 1}.0`;
        break;
      case "major":
        to = `${maj + 1}.0.0`;
        break;
      case "readonly":
        to = project.currentVersion;
        break;
    }
    return {
      from: project.currentVersion,
      to,
      fromBuild: project.currentBuild,
      newBuild: type === "readonly" ? project.currentBuild : project.currentBuild + 1,
    };
  },

  labelFor(type: VersionChangeType): string {
    return {
      bugfix: "Correction de bug",
      feature: "Nouvelle fonctionnalité",
      major: "Nouvelle version majeure",
      readonly: "Voir uniquement la version",
    }[type];
  },
};

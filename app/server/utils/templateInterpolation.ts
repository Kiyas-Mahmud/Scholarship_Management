type NullableString = string | null | undefined;

export type TemplateInterpolationContext = {
  user: {
    id: string;
    email: string;
    fullName?: NullableString;
  };
  profile?: {
    fullName?: NullableString;
    degreeTarget?: NullableString;
    researchInterests?: NullableString;
    preferredCountries?: NullableString;
    signatureBlock?: NullableString;
    cvFileUrl?: NullableString;
  };
  professor: {
    id: string;
    professorName: string;
    email: string;
    universityName: string;
    department?: NullableString;
    country?: NullableString;
    researchArea?: NullableString;
    status?: NullableString;
  };
};

export type InterpolationResult = {
  output: string;
  missingVariables: string[];
  unsupportedVariables: string[];
  resolvedVariables: Record<string, string>;
};

const toText = (value: NullableString) => (value ?? "").toString().trim();

const variableResolvers: Record<
  string,
  (context: TemplateInterpolationContext) => string
> = {
  "user.id": (context) => toText(context.user.id),
  "user.email": (context) => toText(context.user.email),
  "user.fullName": (context) =>
    toText(context.user.fullName) || toText(context.profile?.fullName),

  "profile.fullName": (context) => toText(context.profile?.fullName),
  "profile.degreeTarget": (context) => toText(context.profile?.degreeTarget),
  "profile.researchInterests": (context) =>
    toText(context.profile?.researchInterests),
  "profile.preferredCountries": (context) =>
    toText(context.profile?.preferredCountries),
  "profile.signatureBlock": (context) =>
    toText(context.profile?.signatureBlock),
  "profile.cvFileUrl": (context) => toText(context.profile?.cvFileUrl),

  "professor.id": (context) => toText(context.professor.id),
  "professor.professorName": (context) => toText(context.professor.professorName),
  "professor.email": (context) => toText(context.professor.email),
  "professor.universityName": (context) =>
    toText(context.professor.universityName),
  "professor.department": (context) => toText(context.professor.department),
  "professor.country": (context) => toText(context.professor.country),
  "professor.researchArea": (context) => toText(context.professor.researchArea),
  "professor.status": (context) => toText(context.professor.status),
};

export const SUPPORTED_TEMPLATE_VARIABLES = Object.freeze(
  Object.keys(variableResolvers).sort(),
);

const normalizeToken = (token: string) => token.trim();

export const interpolateTemplateText = (
  input: string,
  context: TemplateInterpolationContext,
): InterpolationResult => {
  const missingVariables = new Set<string>();
  const unsupportedVariables = new Set<string>();
  const resolvedVariables = new Map<string, string>();

  const output = input.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (match, rawToken) => {
    const token = normalizeToken(rawToken);
    const resolver = variableResolvers[token];

    if (!resolver) {
      unsupportedVariables.add(token);
      return match;
    }

    const value = resolver(context);
    resolvedVariables.set(token, value);

    if (!value) {
      missingVariables.add(token);
    }

    return value;
  });

  return {
    output,
    missingVariables: [...missingVariables].sort(),
    unsupportedVariables: [...unsupportedVariables].sort(),
    resolvedVariables: Object.fromEntries(
      [...resolvedVariables.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    ),
  };
};

export const interpolateTemplate = (
  template: {
    subject: string;
    body: string;
  },
  context: TemplateInterpolationContext,
) => {
  const subjectResult = interpolateTemplateText(template.subject, context);
  const bodyResult = interpolateTemplateText(template.body, context);

  return {
    subjectFinal: subjectResult.output,
    bodyFinal: bodyResult.output,
    missingVariables: [
      ...new Set([...subjectResult.missingVariables, ...bodyResult.missingVariables]),
    ].sort(),
    unsupportedVariables: [
      ...new Set([
        ...subjectResult.unsupportedVariables,
        ...bodyResult.unsupportedVariables,
      ]),
    ].sort(),
    resolvedVariables: {
      ...subjectResult.resolvedVariables,
      ...bodyResult.resolvedVariables,
    },
  };
};

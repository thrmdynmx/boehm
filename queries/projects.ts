export const projectsQuery = groq`
  *[_type == "project"] | order(orderRank) {
    _id,
    title,
    "slug": slug.current,
    _updatedAt,
    video
  }
`;

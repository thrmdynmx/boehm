export const infoQuery = groq`
    *[_type == "info"][0] {
    _id,
    info,
    "mainFilm": mainFilm.asset -> url,
    _updatedAt
    }
`;

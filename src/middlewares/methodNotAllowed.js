export const methodNotAllowed = (req, res) => {
    res.status(405).send();
};
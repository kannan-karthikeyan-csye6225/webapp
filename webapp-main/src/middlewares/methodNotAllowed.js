export const methodNotAllowed = (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(405).send();
};
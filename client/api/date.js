export default (req, res) => {
    const date = new Date();
    res.status(200).send(`Current Server Time (ESM): ${date.toISOString()}`);
};

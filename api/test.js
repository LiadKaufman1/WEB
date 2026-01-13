module.exports = (req, res) => {
    res.status(200).send("API Working: " + new Date().toISOString());
};

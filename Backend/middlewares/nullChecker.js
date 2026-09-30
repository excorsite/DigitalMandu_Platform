const nullCheck = (res, message, ...params) => {
    for (const param of params) {
        if (!param) {
            return res.status(400).json({
                message: message || "All parameters must be provided."
            });
        }
    }
}

module.exports = nullCheck;

// notice: currently this fnction is not working currnetlyy if it works i will remove thsi comment 
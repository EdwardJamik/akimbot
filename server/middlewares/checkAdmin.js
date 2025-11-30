const checkAdmin = (req, res, next) => {
	try {
		const keyFromFront = req.headers["x-key"];
		
		if (!keyFromFront) {
			return res.status(401).json({ message: "Not authenticated" });
		}
		
		if (keyFromFront !== process.env.JWT_SECRET) {
			return res.status(403).json({ message: "Access denied. Wrong admin key." });
		}
		
		next();
	} catch (err) {
		console.error("Admin check error:", err);
		res.status(500).json({ message: "Server error" });
	}
};

module.exports = checkAdmin
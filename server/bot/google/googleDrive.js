const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/*
  ФАЙЛ service-account.json повинен лежати в цій же папці!
*/

const auth = new google.auth.GoogleAuth({
	credentials: JSON.parse(
		fs.readFileSync(path.join(__dirname, 'service-account.json'))
	),
	scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({
	version: 'v3',
	auth,
});

async function giveAccess(folderId, userEmail) {
	try {
		await drive.permissions.create({
			fileId: folderId,
			requestBody: {
				role: 'reader',
				type: 'user',
				emailAddress: userEmail,
			},
			sendNotificationEmail: true,
		});
		
		return {
			success: true,
			message: `Access granted to folder ${folderId} for ${userEmail}`,
		};
		
	} catch (error) {
		console.error("❌ Google Drive permission error:", error);
		return {
			success: false,
			error: error.message,
		};
	}
}

/**
 * Надання доступу відповідно до курсу
 */
async function giveAccessByCourse(courseId, userEmail) {
	try {
		
		if (!courseId || !userEmail) {
			return {
				success: false,
				error: `Folder for course '${courseId}' not found`,
			};
		}
		
		return await giveAccess(courseId, userEmail);
		
	} catch (error) {
		console.error("❌ giveAccessByCourse error:", error);
		return {
			success: false,
			error: error.message,
		};
	}
}

module.exports = {
	giveAccess,
	giveAccessByCourse,
};

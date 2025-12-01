const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const stream = require("stream");
ffmpeg.setFfmpegPath(ffmpegPath);

async function audioConvert(fileBuffer) {
	try {
		return new Promise((resolve, reject) => {
			const inputStream = new stream.PassThrough();
			inputStream.end(fileBuffer);
			
			const outputStream = new stream.PassThrough();
			const chunks = [];
			
			outputStream.on("data", (chunk) => chunks.push(chunk));
			outputStream.on("end", () => resolve(Buffer.concat(chunks)));
			outputStream.on("error", reject);
			
			ffmpeg(inputStream)
				.audioCodec("libopus")
				.audioBitrate("16k")
				.format("opus")
				.audioChannels(1)
				.on("error", reject)
				.pipe(outputStream, { end: true });
		});
	} catch (e) {
		console.error(e)
	}
	
}

module.exports = { audioConvert };

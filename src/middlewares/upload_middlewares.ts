import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createTempDir = () => {
    const baseDir = path.resolve('temp_uploads');
    const sessionDir = path.join(baseDir, 'session_' + Date.now());

    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }
    return sessionDir;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempDir = createTempDir();
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

export const uploadImages = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if(['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PNG, JPG, JPEG, GIF, and WEBP are allowed.'));
        }
    }
})

export const uploadDocuments = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if(['.pdf', '.doc', '.docx', '.txt'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT are allowed.'));
        }
    }
})

export const cleanupOldTempDirectories = () => {
    const baseDir = path.resolve('temp_uploads');

    if (!fs.existsSync(baseDir)) return;

    try {
        const directories = fs.readdirSync(baseDir);
        const now = Date.now();
        const maxAge = 60 * 60 * 1000;

        directories.forEach(dir => {
            const dirPath = path.join(baseDir, dir);
            const stats = fs.statSync(dirPath);

            if (stats.isDirectory() && (now - stats.mtime.getTime()) > maxAge) {
                fs.rmSync(dirPath, { recursive: true, force: true });
                console.log(`Removed old temp directory: ${dirPath}`);
            }
        });
    } catch (error) {
        console.error('Error cleaning up old temp directories:', error);
    }
}
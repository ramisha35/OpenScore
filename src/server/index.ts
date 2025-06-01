import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { OpenAPIInputHandler } from '../parser/openAPIInputHandler';
import { scoringEngine } from '../scoring/scoringEngine';
import { reportManager } from '../reporting/reportManager';

const app = express();
const port = process.env.PORT || 3001;

const createDirectories = () => {
  const dirs = ['reports', 'uploads', 'src/frontend'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

const inputHandler = new OpenAPIInputHandler();
const scorer = new scoringEngine();
const reporter = new reportManager();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/reports', express.static('reports'));

app.use(express.static('src/frontend'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedTypes = ['.yaml', '.yml', '.json'];
    if (allowedTypes.includes(ext)) cb(null, true);
    else cb(new Error('Only YAML and JSON files are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

app.post('/api/upload', upload.single('spec'), asyncHandler(async (req, res) => {
  try {
    const { file } = req;
    const { format = 'all' } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    console.log(`📄 Processing: ${file.originalname}`);

    const document = await inputHandler.handleInput(file.path);
    const result = await scorer.scoreOpenAPISpec(document);

    const reportsDir = 'reports';
    const apiTitle = document.info?.title || file.originalname.replace(/\.[^/.]+$/, '');

    const exportedFiles = await reporter.exportReport(result, format, reportsDir, apiTitle);

    const reportUrls = exportedFiles.map(filePath => {
      const relativePath = path.relative('reports', filePath).replace(/\\/g, '/');
      return {
        format: path.extname(filePath).slice(1),
        url: `/reports/${relativePath}`,
        filename: path.basename(filePath)
      };
    });

    fs.unlinkSync(file.path);

    res.json({
      success: true,
      apiTitle,
      score: result,
      reports: reportUrls
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: error.message });
  }
}));

app.post('/api/score-url', asyncHandler(async (req, res) => {
  try {
    const { url, format = 'all' } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    console.log(`📄 Processing URL: ${url}`);

    const document = await inputHandler.handleInput(url);
    const result = await scorer.scoreOpenAPISpec(document);

    const reportsDir = 'reports';
    const apiTitle = document.info?.title || 'Remote API';

    const exportedFiles = await reporter.exportReport(result, format, reportsDir, apiTitle);

    const reportUrls = exportedFiles.map(filePath => {
      const relativePath = path.relative('reports', filePath).replace(/\\/g, '/');
      return {
        format: path.extname(filePath).slice(1),
        url: `/reports/${relativePath}`,
        filename: path.basename(filePath)
      };
    });

    res.json({
      success: true,
      apiTitle,
      score: result,
      reports: reportUrls
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}));


app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK' });
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`🚀 OpenAPI Scorer running on http://localhost:${port}`);
});

export default app;

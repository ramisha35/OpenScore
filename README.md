# OpenScore - OpenAPI Specification Scorer

A tool that evaluates OpenAPI (v3.x) specifications against industry best practices and provides detailed scorecards with actionable feedback.

## About This Project

This project was built for the Theneo 2025 Internship Challenge. OpenScore analyzes OpenAPI specifications and scores them based on documentation quality, API design patterns, security, and other best practices.

## Features

- Modular analyzer system - each scoring criterion has its own analyzer
- Multiple input methods - load specs from local files or URLs
- 100-point scoring system across 7 criteria
- Multiple export formats (JSON, HTML, Markdown)
- Both CLI and web interfaces
- Comprehensive error handling
- File upload support via web interface
- Full TypeScript implementation

## Project Structure

```
OpenScore/
├── src/
│   ├── analyzers/                    # Individual scoring analyzers
│   │   ├── baseAnalyzer.ts
│   │   ├── descriptionsAndDocumentationAnalyzer.ts
│   │   ├── examplesAndSamplesAnalyzer.ts
│   │   ├── miscellaneousBestPracticesAnalyzer.ts
│   │   ├── pathsAndOperationsAnalyzer.ts
│   │   ├── responseCodesAnalyzer.ts
│   │   ├── schemaAndTypesAnalyzers.ts
│   │   ├── securityAnalyzer.ts
│   │   └── index.ts
│   ├── errors/                       # Error handling
│   │   ├── baseParserError.ts
│   │   ├── connectionError.ts
│   │   ├── resolverParserError.ts
│   │   ├── syntaxParserError.ts
│   │   ├── validationParserError.ts
│   │   └── index.ts
│   ├── frontend/
│   │   └── index.html               # Basic web UI
│   ├── parser/
│   │   ├── errorFormatter.ts
│   │   └── openAPIInputHandler.ts
│   ├── reporting/                    # Report generators
│   │   ├── baseReportGenerator.ts
│   │   ├── htmlReportGenerator.ts
│   │   ├── jsonReportGenerator.ts
│   │   ├── markdownReportGenerator.ts
│   │   ├── reportManager.ts
│   │   └── index.ts
│   ├── scoring/
│   │   ├── scoringConfiguration.ts
│   │   ├── scoringEngine.ts
│   │   └── types.ts
│   ├── server/
│   │   └── index.ts                 # Express server
│   ├── tests/
│   │   ├── integration/
│   │   │   └── scoring.test.ts
│   │   └── unit/
│   │       └── analyzers.test.ts
│   └── index.ts                     # CLI entry point
├── uploads/                          # File uploads go here
├── dist/                            # Compiled JavaScript
├── reports/                         # Generated reports
└── README.md
```

## Installation

You'll need Node.js (v16+) and npm.

```bash
git clone https://github.com/ramisha35/OpenScore.git
cd OpenScore
npm install
npm run build
```

## Usage

### Web Interface (Easiest)

```bash
npm run dev
```

Go to `http://localhost:3001` and upload an OpenAPI spec file. You'll get a detailed report showing what needs to be fixed.

### Command Line

```bash
npm run dev:console
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET    | `/`      | Main page with upload form |
| POST   | `/upload`| Upload and analyze a spec |
| GET    | `/health`| Health check |

## How the Scoring Works

The tool evaluates specs across 7 areas for a total of 100 points:

**Schema & Types (20 points)**
- Proper data types
- No free-form objects without schemas
- Type consistency

**Descriptions & Documentation (20 points)**
- All endpoints have descriptions
- Parameters are documented
- Clear operation summaries

**Paths & Operations (15 points)**
- Consistent naming (kebab-case recommended)
- Proper CRUD patterns
- No redundant paths

**Response Codes (15 points)**
- Correct HTTP status codes
- Both success and error responses defined
- Consistent error handling

**Examples & Samples (10 points)**
- Request/response examples provided
- Parameter examples included
- Schema examples available

**Security (10 points)**
- Security schemes defined
- Security requirements applied to operations
- Appropriate auth methods

**Best Practices (10 points)**
- API versioning
- Server descriptions
- Component reuse
- Proper tagging

## Testing

Run all tests:
```bash
npm test
```

Run specific test suites:
```bash
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:watch          # Watch mode for development
npm run test:coverage       # Generate coverage report
```

## Development

```bash
npm run dev          # Start dev server with hot reload
npm run dev:console  # Run CLI version
npm run build        # Compile TypeScript
npm run test:watch   # Tests in watch mode
```

Sample Output
When you analyze a spec (like the Swagger Petstore), you get comprehensive JSON output:
<pre>
```json
{
  "metadata": {
    "timestamp": "2025-06-02T10:09:29.794Z",
    "apiTitle": "Swagger Petstore - OpenAPI 3.0",
    "generator": "Theneo OpenAPI Scorer",
    "version": "1.0.0"
  },
  "summary": {
    "overallScore": 28,
    "grade": "F",
    "gradeDescription": "Poor", 
    "totalIssues": 111,
    "issueBreakdown": {
      "criticalIssues": 0,
      "highIssues": 13,
      "mediumIssues": 49,
      "lowIssues": 49
    }
  },
  "analysis": {
    "criterionResults": [
      {
        "criterion": "Schema & Types",
        "score": 20,
        "maxScore": 20,
        "percentage": 100,
        "weight": 0.2,
        "weightedScore": 20,
        "issueCount": 0,
        "issues": []
      },
      {
        "criterion": "Descriptions & Documentation", 
        "score": 0,
        "maxScore": 20,
        "percentage": 0,
        "weight": 0.2,
        "weightedScore": 0,
        "issueCount": 35,
        "issues": [
          {
            "path": "/pet/{petId}",
            "operation": "delete",
            "location": "parameters[0] (api_key in header)",
            "description": "Parameter 'api_key' has no description",
            "severity": "medium",
            "suggestion": "Add a clear description explaining the parameter purpose, constraints, and format",
            "criterion": "Descriptions & Documentation"
          },
          {
            "path": "components/schemas",
            "location": "User.properties.email",
            "description": "Property 'email' in schema 'User' has no description",
            "severity": "low",
            "suggestion": "Add a description explaining what this property represents",
            "criterion": "Descriptions & Documentation"
          }
          // ... 33 more documentation issues
        ]
      },
      {
        "criterion": "Security",
        "score": 0,
        "maxScore": 10,
        "percentage": 0,
        "weight": 0.1,
        "weightedScore": 0,
        "issueCount": 11,
        "issues": [
          {
            "path": "/store/order",
            "operation": "post",
            "location": "security",
            "description": "POST operation has no security requirements",
            "severity": "high",
            "suggestion": "Add security requirements for write operations",
            "criterion": "Security"
          }
        ]
      }
      // ... 4 more criteria with detailed breakdowns
    ]
  },
  "statistics": {
    "criteriaCount": 7,
    "passedCriteria": 1,
    "averageScore": 25,
    "worstPerformingCriterion": {
      "criterion": "Descriptions & Documentation",
      "score": 0,
      "percentage": 0,
      "issueCount": 35
    },
    "bestPerformingCriterion": {
      "criterion": "Schema & Types", 
      "score": 20,
      "percentage": 100,
      "issueCount": 0
    }
  },
  "recommendations": [
    "Critical: Overall score is below 60. Immediate action required to improve API quality.",
    "Resolve 13 high-priority issue(s) soon.",
    "Focus on improving 'Descriptions & Documentation' - currently at 0%.",
    "Focus on improving 'Security' - currently at 0%."
  ]
}
</pre>

Each issue tells you exactly where the problem is and how to fix it.


## Architecture Notes

The analyzer system is modular - each scoring criterion has its own analyzer class that extends a base analyzer. This makes it easy to add new criteria or modify existing ones.

Error handling is comprehensive with specific error types for different scenarios (parser errors, connection issues, etc.).

The reporting system supports multiple output formats through a plugin-like architecture.

**GitHub**: [@ramisha35](https://github.com/ramisha35)  
**Project**: [https://github.com/ramisha35/OpenScore](https://github.com/ramisha35/OpenScore)

---

Built for the Theneo 2025 Internship Challenge






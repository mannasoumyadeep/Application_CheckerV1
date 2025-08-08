# Indian Patent Application Status Checker

A professional web application for checking the status of Indian patent applications in bulk.

## Features

- **Bulk Processing**: Process up to 100 patent applications at once
- **Excel Integration**: Upload Excel files with application numbers
- **Real-time Progress**: Live progress tracking with detailed statistics
- **Error Handling**: Comprehensive error reporting and retry mechanisms
- **Export Results**: Download results and errors in Excel format
- **Responsive Design**: Works on desktop and mobile devices
- **Professional UI**: Clean, office-friendly interface

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- React Router for navigation
- Sonner for toast notifications

### Backend
- Vercel Serverless Functions
- Python 3.9
- Selenium WebDriver for web automation
- Chrome headless browser
- Pydantic for data validation

## Prerequisites

- Node.js 18+ 
- Python 3.9
- Vercel account
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd patent-status-checker
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Python Dependencies

```bash
cd api/process-application
pip install -r requirements.txt
cd ../..
```

### 4. Local Development

To run the frontend locally:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

To test the API locally, you can run the Python function:

```bash
cd api/process-application
python index.py
```

## Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy to Vercel

```bash
vercel
```

Follow the prompts to deploy your application. Vercel will automatically detect both the frontend and backend functions.

### 4. Environment Variables (Optional)

If you need to configure any environment variables, you can set them in the Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add any required variables

## Important Notes

### Chrome WebDriver on Vercel

The serverless function uses Chrome in headless mode to automate the Indian Patent Office website. Vercel serverless functions have some limitations:

- **Execution Timeout**: Maximum 60 seconds per function execution
- **Memory Limit**: 1024MB for Hobby plan, higher for Pro plans
- **Cold Starts**: First request may take longer as Chrome needs to initialize

### Performance Considerations

- Each application number takes approximately 10-30 seconds to process
- Processing is done sequentially to avoid overwhelming the server
- The system includes automatic retry mechanisms for failed requests
- Captcha solving is handled automatically using the audio method

### Rate Limiting

The Indian Patent Office website may implement rate limiting. The system includes:

- Automatic delays between requests
- Retry mechanisms with exponential backoff
- Error handling for blocked requests

## Usage

1. **Upload Excel File**: 
   - Click "Select Excel File" or drag and drop your file
   - Ensure application numbers are in the first column
   - Maximum 100 applications per file

2. **Process Applications**:
   - Review the application numbers to be processed
   - Click "Start Processing" to begin
   - Monitor progress in real-time

3. **View Results**:
   - Results are displayed in a tabbed interface
   - Switch between "All", "Successful", and "Errors" tabs
   - Each application shows detailed status information

4. **Export Data**:
   - Click "Export All Results" to download complete results
   - Click "Export Errors Only" to download failed applications
   - Files are downloaded in Excel format

## File Format Requirements

### Excel File Format

- **Column A**: Application numbers (11 digits, e.g., 20231234567)
- **No headers**: First row should contain the first application number
- **Format**: .xlsx or .xls files only
- **Maximum**: 100 application numbers per file

### Sample Data

```
20231234567
20231234568
20231234569
```

## Troubleshooting

### Common Issues

1. **Chrome WebDriver Issues**:
   - Ensure all Python dependencies are installed
   - Check Vercel function logs for Chrome initialization errors
   - Verify Chrome version compatibility

2. **Captcha Solving Failures**:
   - The system uses audio captcha solving
   - Check if the patent office website has changed their captcha mechanism
   - Review function logs for captcha-related errors

3. **Timeout Errors**:
   - Reduce batch size (fewer applications per request)
   - Check Vercel function execution logs
   - Consider upgrading to Vercel Pro plan for longer timeouts

4. **CORS Issues**:
   - The API includes CORS headers
   - Ensure frontend is calling the correct API endpoint
   - Check Vercel deployment logs

### Debug Mode

To enable debug logging, you can modify the Python function to include more detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Support

For issues and questions:
1. Check Vercel function logs
2. Review browser console for frontend errors
3. Verify file format and application number format
4. Ensure stable internet connection during processing

## License

This project is for internal office use only.
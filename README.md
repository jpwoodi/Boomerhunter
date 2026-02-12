# 🎯 BoomerHunter

A web application designed for search funds to identify UK companies with directors approaching retirement age. Built with Next.js and integrated with the Companies House API.

## Features

- **Director Age Analysis**: Automatically calculates director ages and identifies those approaching retirement (default: 60-75 years old)
- **Industry Filtering**: Search and filter companies by SIC (Standard Industrial Classification) codes
- **Company Search**: Find companies by name or browse active companies
- **Real-time Data**: Direct integration with Companies House API for up-to-date company and director information
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- A Companies House API key (free to obtain)

## Getting Your Companies House API Key

1. Go to [Companies House Developer Hub](https://developer.company-information.service.gov.uk/)
2. Register for a free account
3. Create an application to get your API key
4. The API key will be used as the username in Basic Authentication (password can be left empty)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Boomerhunter
```

2. Install dependencies:
```bash
npm install
```

3. Create your environment file:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your Companies House API key:
```
COMPANIES_HOUSE_API_KEY=your_actual_api_key_here
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## How to Use

1. **Basic Search**: Enter a company name or leave blank to browse companies
2. **Age Range**: Adjust the minimum and maximum director age filters (default: 60-75)
3. **Industry Filter**: Enter a SIC code to narrow results to specific industries
4. **View Results**: Companies are displayed with director information, highlighting those in the retirement age range

### Example Searches

- **Technology Companies**: SIC code `62` (Computer programming, consultancy, etc.)
- **Manufacturing**: SIC code `25` (Manufacture of fabricated metal products)
- **Retail**: SIC code `47` (Retail trade)
- **Construction**: SIC code `41` (Construction of buildings)

## Project Structure

```
Boomerhunter/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.ts          # API endpoint for company search
│   ├── globals.css                # Global styles and Tailwind imports
│   ├── layout.tsx                 # Root layout component
│   └── page.tsx                   # Main page component
├── components/
│   ├── SearchFilters.tsx          # Search filter UI component
│   └── CompanyResults.tsx         # Results display component
├── lib/
│   ├── services/
│   │   └── companiesHouse.ts     # Companies House API integration
│   └── utils/
│       └── age.ts                 # Age calculation utilities
├── types/
│   └── index.ts                   # TypeScript type definitions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## API Integration

The application uses the [Companies House API](https://developer.company-information.service.gov.uk/api/docs/) with the following endpoints:

- `/search/companies` - Search for companies by name
- `/company/{companyNumber}` - Get detailed company information
- `/company/{companyNumber}/officers` - Get company directors and officers

### Rate Limits

The Companies House API has rate limits:
- 600 requests per 5 minutes for most endpoints
- The app includes delays between requests to prevent hitting rate limits

## Future Enhancements

- **AI-Powered Analysis**: Integrate AI to fetch and analyze company websites for additional insights
- **Advanced SIC Code Browser**: Add a visual browser for industry categories
- **Export Functionality**: Export results to CSV/Excel
- **Saved Searches**: Save and manage search criteria
- **Email Alerts**: Get notified when new companies match your criteria
- **Bulk Analysis**: Process larger datasets using Companies House bulk data downloads
- **Director Network Analysis**: Identify connections between directors across companies

## Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **API**: Next.js API Routes
- **HTTP Client**: Axios
- **External API**: Companies House API

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

## Support

For issues with:
- **This application**: Open an issue on GitHub
- **Companies House API**: Visit [Companies House Developer Support](https://developer.company-information.service.gov.uk/support)

## Disclaimer

This tool is for research and due diligence purposes only. Always verify information directly with Companies House and conduct proper due diligence before making any business decisions.

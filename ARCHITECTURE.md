# TradeWay - EVE Online Trading Assistant

## Architecture Documentation

### Overview
TradeWay is a Vue 3 web application for EVE Online trading assistance. It integrates with EVE ESI API for character data, market information, and trading analytics.

### Technology Stack
- **Frontend**: Vue 3 with Composition API
- **Build Tool**: Vite
- **Styling**: TailwindCSS with dark theme
- **Routing**: Vue Router 4
- **State Management**: Pinia
- **API Integration**: EVE ESI (EVE Swagger Interface)

### Project Structure

```
TradeWays/
├── public/                     # Static assets
├── src/
│   ├── components/            # Reusable Vue components
│   ├── composables/           # Vue composition functions
│   │   └── useCharacterData.js # Character data loading logic
│   ├── router/                # Vue Router configuration
│   │   └── index.js
│   ├── services/              # API integration services
│   │   ├── esi.js            # ESI OAuth and token management
│   │   └── character.js      # Character data services
│   ├── stores/                # Pinia state management
│   │   └── auth.js           # Authentication state
│   ├── views/                 # Page components
│   │   ├── HomeView.vue      # Main dashboard
│   │   ├── AuthView.vue      # Login page
│   │   ├── AuthCallbackView.vue # OAuth callback handler
│   │   └── MarketView.vue    # Market data page
│   ├── App.vue               # Root component
│   ├── main.js               # Application entry point
│   └── style.css             # Global styles
├── .env.example              # Environment variables template
├── .env.local                # Local environment variables (gitignored)
├── .gitignore                # Git ignore rules
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
├── README.md                 # Project documentation
├── tailwind.config.cjs       # TailwindCSS configuration
└── vite.config.js            # Vite configuration
```

### Core Architecture Components

#### 1. Authentication Flow
```
User → AuthView → EVE SSO → AuthCallbackView → Token Exchange → Character Data → Store → HomeView
```

**Process:**
1. User clicks "Authorize" on AuthView
2. Redirected to EVE SSO for authentication
3. EVE redirects back to AuthCallbackView with authorization code
4. Exchange code for access/refresh tokens
5. Verify tokens and extract character information
6. Load full character data from ESI
7. Store tokens and character data in Pinia
8. Redirect to HomeView

#### 2. State Management (Pinia)

**Auth Store (`src/stores/auth.js`)**
- `accessToken` - OAuth access token
- `refreshToken` - OAuth refresh token
- `character` - Basic character info from verify endpoint
- `characterData` - Extended character data (wallet, location, etc.)
- `expiresAt` - Token expiration timestamp
- `isAuthenticated` - Computed property for auth status

**Methods:**
- `setTokens()` - Store OAuth tokens
- `setCharacter()` - Store basic character info
- `setCharacterData()` - Store extended character data
- `updateCharacterData()` - Update specific character data fields
- `logout()` - Clear all auth data

#### 3. API Services

**ESI Service (`src/services/esi.js`)**
- `buildAuthUrl()` - Generate EVE SSO authorization URL
- `exchangeCodeForTokens()` - Exchange authorization code for tokens
- `verifyToken()` - Verify JWT token and extract character info
- `refreshToken()` - Refresh expired access token

**Character Service (`src/services/character.js`)**
- `loadEssentialCharacterData()` - Load wallet, location, orders, ship
- `loadFullCharacterData()` - Load complete character profile
- `resolveNames()` - Convert ESI IDs to readable names

#### 4. Vue Router Configuration

**Routes:**
- `/` - HomeView (main dashboard)
- `/auth` - AuthView (login page)
- `/auth/callback` - AuthCallbackView (OAuth handler)
- `/market` - MarketView (market data)

#### 5. Composables

**useCharacterData (`src/composables/useCharacterData.js`)**
- Automatically loads character data on component mount
- Handles character ID extraction from different formats
- Merges basic and extended character data
- No caching - always fetches fresh data

### Data Flow

#### Character Data Loading
```
Component Mount → useCharacterData → Check Auth → Extract Character ID → 
Load Essential Data → Resolve Names → Update Store → UI Updates
```

#### Essential Data Endpoints
- `/characters/{id}/wallet/` - Wallet balance
- `/characters/{id}/location/` - Current location (solar_system_id, station_id)
- `/characters/{id}/online/` - Online status and last login
- `/characters/{id}/orders/` - Active market orders
- `/characters/{id}/ship/` - Current ship information

#### Name Resolution
- `/universe/systems/{id}/` - Convert solar_system_id to name
- `/universe/types/{id}/` - Convert ship_type_id to name

### Environment Configuration

**Required Environment Variables (.env.local):**
```bash
VITE_ESI_CLIENT_ID=your_client_id_here
VITE_ESI_CLIENT_SECRET=your_client_secret_here
VITE_ESI_CALLBACK_URL=http://localhost:5173/auth/callback
VITE_ESI_SCOPES=publicData esi-markets.read_character_orders.v1 esi-wallet.read_character_wallet.v1 esi-markets.structure_markets.v1 esi-location.read_location.v1 esi-location.read_online.v1 esi-location.read_ship_type.v1
```

### Security Considerations

1. **Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
2. **CSRF Protection**: State parameter used in OAuth flow
3. **Scope Limitation**: Minimum required scopes requested
4. **Token Expiration**: Automatic checking of token expiration
5. **Environment Variables**: Sensitive data in .env.local (gitignored)

### Error Handling

1. **OAuth Errors**: Invalid state, token exchange failures
2. **API Errors**: Rate limiting, invalid permissions, network issues
3. **Data Validation**: Graceful fallbacks for missing character data
4. **UI Feedback**: Loading states and error messages

### Performance Considerations

1. **Parallel Requests**: Multiple ESI endpoints called simultaneously
2. **No Caching**: Fresh data loaded each page load (configurable)
3. **Lazy Loading**: Character data loaded only when needed
4. **Error Boundaries**: Failed requests don't break entire app

### Development Guidelines

#### Adding New ESI Endpoints
1. Add endpoint to `loadEssentialCharacterData()` or create new function
2. Update TypeScript interfaces if using TypeScript
3. Add UI components to display new data
4. Update required scopes in .env.local

#### Adding New Pages
1. Create view component in `src/views/`
2. Add route in `src/router/index.js`
3. Update navigation if needed
4. Add authentication guards if required

#### State Management
- Use Pinia stores for global state
- Keep component state local when possible
- Persist important data in localStorage
- Clear sensitive data on logout

### Future Enhancements

1. **Backend API**: Add Express.js backend for data processing
2. **Real-time Updates**: WebSocket for live market data
3. **Advanced Analytics**: Profit calculations, trends analysis
4. **Multi-character Support**: Switch between characters
5. **Mobile App**: React Native or PWA implementation
6. **Data Visualization**: Charts for market trends
7. **Notifications**: Price alerts, order status changes

### Troubleshooting

#### Common Issues
1. **"invalid_scope" Error**: Update scopes in EVE Developer Portal and .env.local
2. **"redirect_url_mismatch"**: Ensure callback URL matches EVE Developer Portal exactly
3. **Character Data Not Loading**: Check token expiration and API permissions
4. **CORS Issues**: Ensure proper headers in ESI requests

#### Debug Mode
Add console.log statements to track:
- Token exchange process
- Character data loading
- API response statuses
- Store state changes

Remember to remove debug logs before production deployment.

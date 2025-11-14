/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export function Fragment(props: { children?: any }): any;
}

// Module declarations for packages (will be resolved when dependencies are installed)
declare module 'react' {
  const React: any;
  export = React;
  export const useEffect: any;
  export const useState: any;
  export const useContext: any;
  export const createContext: any;
  export default React;
}

declare module 'react-router-dom' {
  export const Link: any;
  export const useNavigate: any;
  export const useLocation: any;
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
  export const Navigate: any;
}

declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
}

declare module 'lucide-react' {
  export const ArrowUpRight: any;
  export const ArrowDownLeft: any;
  export const ArrowUpDown: any;
  export const TrendingUp: any;
  export const Wallet: any;
  export const Eye: any;
  export const EyeOff: any;
  export const Copy: any;
  export const Check: any;
  export const Plus: any;
  export const Trash2: any;
  export const Edit2: any;
  export const QrCode: any;
  export const AlertTriangle: any;
  export const Zap: any;
  export const Filter: any;
  export const ExternalLink: any;
  export const Settings: any;
  export const Moon: any;
  export const Sun: any;
  export const Shield: any;
  export const Bell: any;
  export const Network: any;
  export const LogOut: any;
  export const Key: any;
  export const Mail: any;
  export const Download: any;
  export const Menu: any;
  export const X: any;
  export const Home: any;
  export const Send: any;
  export const CheckCircle: any;
  export const XCircle: any;
  export const ArrowRight: any;
}

declare module 'recharts' {
  export const LineChart: any;
  export const Line: any;
  export const XAxis: any;
  export const YAxis: any;
  export const ResponsiveContainer: any;
  export const Tooltip: any;
  export const BarChart: any;
  export const Bar: any;
}

// JSX namespace declarations
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface Element extends React.ReactElement<any, any> {}
  interface ElementClass extends React.Component<any> {}
  interface ElementAttributesProperty {
    props: {};
  }
  interface ElementChildrenAttribute {
    children: {};
  }
}


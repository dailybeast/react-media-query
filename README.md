react-media-query
=======

[![npm Version](https://img.shields.io/npm/v/@dailybeast/react-media-query.svg)](https://www.npmjs.com/package/@dailybeast/react-media-query) [![License](https://img.shields.io/npm/l/@dailybeast/react-media-query.svg)](https://www.npmjs.com/package/@dailybeast/react-media-query)

MediaQuery is a React component that helps to render different layouts on different devices and viewport sizes.

### Installation

```bash
npm i @dailybeast/react-media-query --save
```

### Usage
Let's say you have a DesktopComponent you need to render only on desktop viewport size and you have also a MobileComponent - only for mobile/tablet viewport sizes.
All you need to do - wrap these components in MediaQuery and specify the breakpoints via the 'breakpoints' prop.

```javascript
import MediaQuery, { BREAKPOINT } from '@dailybeast/react-media-query';
import DesktopComponent from './DesktopComponent';
import MobileComponent from './MobileComponent';

export default function Page() {
  return (
    <div className="Page">
      <MediaQuery breakpoints={[BREAKPOINT.DESKTOP]}>
        <DesktopComponent />
      </MediaQuery>
      
      <MediaQuery breakpoints={[BREAKPOINT.TABLET, BREAKPOINT.MOBILE]}>
        <MobileComponent />
      </MediaQuery>
    </div>
  );
}
```

### Available props
 
```javascript
propTypes = {
  // array of breakpoints when the `children` will be rendered
  breakpoints: PropTypes.arrayOf(PropTypes.string),
  // current device type you detected on server (from Request object)
  // it's optional and should be used only when you use server-rendering
  guessedBreakpoint: PropTypes.string,
  // array of additional media queries
  queries: PropTypes.arrayOf(PropTypes.shape({
    minWidth: PropTypes.number,
    maxWidth: PropTypes.number,
    maxDeviceWidth: PropTypes.number,
    maxDeviceHeight: PropTypes.number,
  })),
  // something you want to render
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.string,
  ]).isRequired,
  // if you want to render 'children' inside of a wrapper-element you can specify it via 'wrapper' prop
  wrapper: PropTypes.string,
};
```

### Available breakpoints (device types)
```javascript
export const BREAKPOINT = {
  DESKTOP: 'desktop',
  TABLET: 'tablet',
  MOBILE: 'mobile',
  MOBILE_LANDSCAPE: 'mobileLandscape',
};
```

### Using queries
Default breakpoints use following default queries:
```javascript
export const QUERY = {
  [BREAKPOINT.DESKTOP]: {
    minWidth: 1032,
  },
  [BREAKPOINT.TABLET]: {
    minWidth: 704,
    maxWidth: 1031,
  },
  [BREAKPOINT.MOBILE]: {
    maxWidth: 703,
  },
  [BREAKPOINT.MOBILE_LANDSCAPE]: {
    landscape: true,
    maxDeviceHeight: 703,
  }
};
```
If you want to specify some other breakpoints, you should use 'queries' prop:
```javascript
<MediaQuery
  queries={[
    { minWidth: 380, maxWidth: 1000 },
    { landscape: true }
  ]}
>
  This text will be rendered only when the viewport width is >= 300px AND <= 1000, OR device is in landscape mode.
</MediaQuery>
```

### Using wrappers
When rendered you 'children' can be wrapped into a specified html tag:
```javascript
<MediaQuery
  breakpoints={[BREAKPOINT.DESKTOP]}
  wrapper="span"
>
  This text will be rendered inside of 'span' when the viewport width matches 'desktop'
</MediaQuery>
```

Made by [The Daily Beast](https://thedailybeast.com) team

<img src="https://pbs.twimg.com/profile_images/862673271212441600/u_DNSQ_Q.jpg" width="220" />

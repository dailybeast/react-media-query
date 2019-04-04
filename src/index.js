import PropTypes from 'prop-types';
import React, { Component } from 'react';
import throttle from 'lodash/throttle';
import { canUseDOM } from 'exenv';

export const BREAKPOINT = {
  DESKTOP: 'desktop',
  TABLET: 'tablet',
  MOBILE: 'mobile',
  MOBILE_LANDSCAPE: 'mobileLandscape',
};

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

export default class MediaQuery extends Component {
  static propTypes = {
    breakpoints: PropTypes.arrayOf(PropTypes.string),
    guessedBreakpoint: PropTypes.string,
    queries: PropTypes.arrayOf(PropTypes.shape({
      minWidth: PropTypes.number,
      maxWidth: PropTypes.number,
      maxDeviceWidth: PropTypes.number,
      maxDeviceHeight: PropTypes.number,
      landscape: PropTypes.bool,
    })),
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element),
      PropTypes.string,
    ]).isRequired,
    wrapper: PropTypes.string,
  };

  static defaultProps = {
    breakpoints: [],
    queries: [],
  };

  /* istanbul ignore next */
  constructor(props) {
    super(props);

    this.state = {
      viewportWidth: global.window ? global.window.innerWidth : 0,
      deviceWidth: global.window ? global.window.screen.availWidth : 0,
      deviceHeight: global.window ? global.window.screen.availHeight : 0,
      landscape: false,
    };

    this.firstRun = true;
    this.recalculate = this.recalculate.bind(this);
    this.matchDefaultBreakpoint = this.matchDefaultBreakpoint.bind(this);
    this.matchAllQueries = this.matchAllQueries.bind(this);
    this.matchQuery = this.matchQuery.bind(this);
    this.shouldQueryUpdate = this.shouldQueryUpdate.bind(this);
    this.renderComponent = this.renderComponent.bind(this);

    this.throttledRecalculate = throttle(this.recalculate, 200);
  }

  componentDidMount() {
    this.recalculate();

    global.window.addEventListener('resize', this.throttledRecalculate);
  }

  componentWillUnmount() {
    global.window.removeEventListener('resize', this.throttledRecalculate);
  }

  recalculate() {
    const viewportWidth = global.window.innerWidth;
    const deviceWidth = global.window.screen.availWidth;
    const deviceHeight = global.window.screen.availHeight;
    const landscape = deviceHeight < deviceWidth;
    if (this.matchAllQueries() || !this.firstRun) {
      this.firstRun = false;
      this.setState({
        viewportWidth,
        deviceWidth,
        deviceHeight,
        landscape,
      });
    }

  }

  matchDefaultBreakpoint() {
    const {
      breakpoints,
      guessedBreakpoint: defaultBreakpoint,
    } = this.props;

    if (!defaultBreakpoint) {
      return false;
    }

    return !!breakpoints.find(breakpoint => breakpoint === defaultBreakpoint);
  }


  shouldQueryUpdate() {
    const { breakpoints, queries: additionalQueries, guessedBreakpoint: defaultBreakpoint } = this.props;
    // const filteredBreakpoints = breakpoints.filter(breakpoint => {
    //   return (breakpoint !== defaultBreakpoint);
    // })

// first get current active breakpoint
    //next compare it
      // then determine if update is necessary
    // if (!filteredBreakpoints.length) {
    //   return false;
    // }
        // return true;


        const stuff = this.matchAllQueries();




        return true
  }


  matchAllQueries() {
    const { breakpoints, queries: additionalQueries } = this.props;

    const queries = [...breakpoints.map(breakpoint => QUERY[breakpoint]), ...additionalQueries];

    const positiveResult = queries
      .map(query => this.matchQuery(query))
      .find(result => result === true);

    return !!positiveResult;
  }

  matchQuery(query) {
    const {
      minWidth,
      maxWidth,
      maxDeviceWidth,
      maxDeviceHeight,
      landscape,
    } = query;
    const {
      viewportWidth,
      deviceWidth,
      deviceHeight,
      landscape: landscapeMode,
    } = this.state;

    let matches = false;

    if (minWidth) {
      if (viewportWidth >= minWidth) {
        matches = true;
      } else {
        return false;
      }
    }

    if (maxWidth) {
      if (viewportWidth && viewportWidth <= maxWidth) {
        matches = true;
      } else {
        return false;
      }
    }

    if (maxDeviceWidth) {
      if (deviceWidth && deviceWidth <= maxDeviceWidth) {
        matches = true;
      } else {
        return false;
      }
    }

    if (maxDeviceHeight) {
      if (deviceHeight && deviceHeight <= maxDeviceHeight) {
        matches = true;
      } else {
        return false;
      }
    }

    if (landscape) {
      if (landscapeMode === landscape) {
        matches = true;
      } else {
        return false;
      }
    }

    return matches;
  }

  renderComponent() {
    const {
      wrapper: WrapperComponent,
      children,
    } = this.props;

    if (WrapperComponent) {
      return <WrapperComponent>{children}</WrapperComponent>;
    }

    return children;
  }

  render() {
    let node = null;
    if (canUseDOM) {
      // browser
      if (this.matchAllQueries())  {
        node = this.renderComponent();
      }
    } else if (this.matchDefaultBreakpoint()) {
      // server
      node = this.renderComponent();
    }

    return node;
  }
}

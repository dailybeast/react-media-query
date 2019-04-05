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
    guessedInitialWidth: 1280,
  },
  [BREAKPOINT.TABLET]: {
    minWidth: 704,
    maxWidth: 1031,
    guessedInitialWidth: 1024,
  },
  [BREAKPOINT.MOBILE]: {
    maxWidth: 703,
    guessedInitialWidth: 375,
  },
  [BREAKPOINT.MOBILE_LANDSCAPE]: {
    landscape: true,
    maxDeviceHeight: 703,
    guessedInitialWidth: 375,
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

    const guessedWidth = QUERY[props.guessedBreakpoint].guessedInitialWidth;

    this.state = {
      viewportWidth: guessedWidth,
      deviceWidth: 0,
      deviceHeight: 0,
      landscape: false,
    };

    this.recalculate = this.recalculate.bind(this);
    this.matchDefaultBreakpoint = this.matchDefaultBreakpoint.bind(this);
    this.matchAllQueries = this.matchAllQueries.bind(this);
    this.matchQuery = this.matchQuery.bind(this);
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

    this.setState({
      viewportWidth,
      deviceWidth,
      deviceHeight,
      landscape,
    });
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
      if (this.matchAllQueries()) {
        node = this.renderComponent();
      }
    } else if (this.matchDefaultBreakpoint()) {
      // server
      node = this.renderComponent();
    }

    return node;
  }
}

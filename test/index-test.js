import React from 'react';
import test from 'ava';
import sinon from 'sinon';
import Enzyme, { shallow } from 'enzyme';
import EnzymeReact16Adapter from 'enzyme-adapter-react-16';
import MediaQuery, { BREAKPOINT, QUERY, __RewireAPI__ as mediaQueryApi } from '../src';

Enzyme.configure({ adapter: new EnzymeReact16Adapter() });

let mediaQuery;
let instance;

test.beforeEach(() => {
  global.window = {
    innerWidth: 1000,
    innerHeight: 500,
    screen: { availWidth: 1200, availHeight: 600 },
    addEventListener: sinon.spy(),
  };
  mediaQueryApi.__Rewire__('canUseDOM', false);

  mediaQuery = shallow((
    <MediaQuery
      breakpoints={[BREAKPOINT.DESKTOP]}
      guessedBreakpoint={BREAKPOINT.DESKTOP}
    >
      <div className="child-element" />
    </MediaQuery>
  ));
  instance = mediaQuery.instance();
});

test.afterEach(() => {
  mediaQueryApi.__ResetDependency__('canUseDOM');
});

test('componentDidMount() calls recalculate() and then adds event listener to the global resize event', t => {
  instance.recalculate = sinon.spy();
  global.window = {
    addEventListener: sinon.spy(),
  };

  instance.componentDidMount();

  t.true(instance.recalculate.calledOnce);
  t.true(global.window.addEventListener.calledOnce);
  t.true(global.window.addEventListener.calledWith('resize', instance.throttledRecalculate));
});

test('componentWillUnmount() removes event listener to the global resize event', t => {
  global.window = {
    removeEventListener: sinon.spy(),
  };

  instance.componentWillUnmount();

  t.true(global.window.removeEventListener.calledOnce);
  t.true(global.window.removeEventListener.calledWith('resize', instance.throttledRecalculate));
});

test('recalculate() updates the state with viewport and device sizes', t => {
  global.window = {
    innerWidth: 1200,
    innerHeight: 600,
    screen: { availWidth: 1600, availHeight: 800 },
  };
  instance.recalculate();

  t.deepEqual(instance.state, {
    viewportWidth: 1200,
    deviceWidth: 1600,
    deviceHeight: 800,
    landscape: true,
  });

  global.window = {
    innerWidth: 300,
    innerHeight: 1000,
    screen: { availWidth: 400, availHeight: 800 },
  };
  instance.recalculate();

  t.deepEqual(instance.state, {
    viewportWidth: 300,
    deviceWidth: 400,
    deviceHeight: 800,
    landscape: false,
  });
});

test('matchDefaultBreakpoint() returns false if `guessedBreakpoint` does not correspond one of `breakpoints`', t => {
  mediaQuery.setProps({
    breakpoints: [BREAKPOINT.MOBILE, BREAKPOINT.TABLET],
    guessedBreakpoint: BREAKPOINT.DESKTOP,
  });

  t.false(instance.matchDefaultBreakpoint());
});

test('matchDefaultBreakpoint() returns true if `guessedBreakpoint` corresponds one of `breakpoints`', t => {
  mediaQuery.setProps({
    breakpoints: [BREAKPOINT.MOBILE, BREAKPOINT.TABLET],
    guessedBreakpoint: BREAKPOINT.TABLET,
  });

  t.true(instance.matchDefaultBreakpoint());
});

test('matchDefaultBreakpoint() returns false if `guessedBreakpoint` is undefined`', t => {
  mediaQuery.setProps({
    breakpoints: [BREAKPOINT.MOBILE, BREAKPOINT.TABLET, BREAKPOINT.DESKTOP],
    guessedBreakpoint: undefined,
  });

  t.false(instance.matchDefaultBreakpoint());
});

test('matchAllQueries() calls matchQuery() for each breakpoint from `breakpoints` and `queries` and returns true if matchQuery() returns true for any of them', t => {
  const mobileArticleQuery = { maxWidth: 767 };
  const desktopArticleQuery = { minWidth: 768 };
  mediaQuery.setProps({
    breakpoints: [BREAKPOINT.MOBILE, BREAKPOINT.MOBILE_LANDSCAPE, BREAKPOINT.DESKTOP],
    queries: [mobileArticleQuery, desktopArticleQuery],
  });
  instance.matchQuery = sinon.stub().returns(true);

  t.true(instance.matchAllQueries());
  t.is(instance.matchQuery.callCount, 5);
  t.true(instance.matchQuery.calledWith(QUERY[BREAKPOINT.MOBILE]));
  t.true(instance.matchQuery.calledWith(QUERY[BREAKPOINT.MOBILE_LANDSCAPE]));
  t.true(instance.matchQuery.calledWith(QUERY[BREAKPOINT.DESKTOP]));
  t.true(instance.matchQuery.calledWith(mobileArticleQuery));
  t.true(instance.matchQuery.calledWith(desktopArticleQuery));
});

test('matchAllQueries() returns false if matchQuery() returns false for at least one of the queries', t => {
  mediaQuery.setProps({
    breakpoints: [BREAKPOINT.DESKTOP],
  });
  instance.matchQuery = sinon.stub().returns(false);

  t.false(instance.matchAllQueries());
  t.is(instance.matchQuery.callCount, 1);
  t.true(instance.matchQuery.calledWith(QUERY[BREAKPOINT.DESKTOP]));
});

test('matchQuery() returns true only if `viewportWidth` from the state >=`minWidth` from query', t => {
  mediaQuery.setState({
    viewportWidth: 800,
  });

  t.true(instance.matchQuery({ minWidth: 799 }));
  t.true(instance.matchQuery({ minWidth: 800 }));
  t.false(instance.matchQuery({ minWidth: 801 }));
});

test('matchQuery() returns true only if `viewportWidth` from the state <=`maxWidth` from query', t => {
  mediaQuery.setState({
    viewportWidth: 800,
  });

  t.true(instance.matchQuery({ maxWidth: 801 }));
  t.true(instance.matchQuery({ maxWidth: 800 }));
  t.false(instance.matchQuery({ maxWidth: 799 }));
});

test('matchQuery() returns true only if `deviceWidth` from the state <=`maxDeviceWidth` from query', t => {
  mediaQuery.setState({
    deviceWidth: 1024,
  });

  t.true(instance.matchQuery({ maxDeviceWidth: 1025 }));
  t.true(instance.matchQuery({ maxDeviceWidth: 1024 }));
  t.false(instance.matchQuery({ maxDeviceWidth: 1023 }));
});

test('matchQuery() returns true only if `deviceHeight` from the state <=`maxDeviceWidth` from query', t => {
  mediaQuery.setState({
    deviceHeight: 600,
  });

  t.true(instance.matchQuery({ maxDeviceHeight: 601 }));
  t.true(instance.matchQuery({ maxDeviceHeight: 600 }));
  t.false(instance.matchQuery({ maxDeviceHeight: 599 }));
});

test('matchQuery() returns true only if `landscape` from the state =`landscape` from query', t => {
  mediaQuery.setState({
    landscape: true,
  });

  t.true(instance.matchQuery({ landscape: true }));
  t.false(instance.matchQuery({ landscape: false }));

  mediaQuery.setState({
    landscape: false,
  });

  t.false(instance.matchQuery({ landscape: true }));
});

test('matchQuery() returns true only when all parameters from query mathes to the sizes in state', t => {
  mediaQuery.setState({
    viewportWidth: 800,
    deviceWidth: 1024,
    deviceHeight: 600,
    landscape: true,
  });

  t.false(instance.matchQuery({ minWidth: 801, landscape: true }));
  t.true(instance.matchQuery({ minWidth: 400, landscape: true }));
  t.false(instance.matchQuery({ minWidth: 400, maxWidth: 799 }));
  t.true(instance.matchQuery({ minWidth: 400, maxWidth: 801 }));
  t.false(instance.matchQuery({ minWidth: 400, maxDeviceHeight: 400 }));
  t.true(instance.matchQuery({ minWidth: 400, maxDeviceHeight: 600 }));
});

test('matchQuery() returns false if `viewportWidth` is 0', t => {
  mediaQuery.setState({
    viewportWidth: 0,
  });

  t.false(instance.matchQuery({ maxWidth: 703 }));
  t.false(instance.matchQuery({ minWidth: 800 }));
  t.false(instance.matchQuery({ minWidth: 801 }));
});

test('renderComponent() returns `children`', t => {
  const children = instance.renderComponent();

  t.is(children.type, 'div');
  t.is(children.props.className, 'child-element');
});

test('renderComponent() returns `children` wrapped into `component` element', t => {
  mediaQuery.setProps({ component: 'hello' });

  const children = instance.renderComponent();

  t.is(children.type, 'hello');
  t.is(children.props.children.type, 'div');
  t.is(children.props.children.props.className, 'child-element');
});

test('render() returns null instead of children if matchDefaultBreakpoint() returns false and `canUseDOM` is false', t => {
  mediaQueryApi.__Rewire__('canUseDOM', false);
  instance.matchDefaultBreakpoint = () => false;

  const children = instance.render();

  t.is(children, null);
});

test('render() returns null instead of children if matchAllQueries() and matchDefaultBreakpoint() both return false', t => {
  mediaQueryApi.__Rewire__('canUseDOM', true);
  instance.matchAllQueries = () => false;
  instance.matchDefaultBreakpoint = () => false;

  const children = instance.render();

  t.is(children, null);
});

test('render() returns children if matchDefaultBreakpoint() returns true and `canUseDOM` is false', t => {
  mediaQueryApi.__Rewire__('canUseDOM', false);
  instance.matchDefaultBreakpoint = () => true;

  const children = instance.render();

  t.is(children.type, 'div');
});

test('render() returns children if matchAllQueries() returns true and `canUseDOM` is true', t => {
  mediaQueryApi.__Rewire__('canUseDOM', true);
  instance.matchAllQueries = () => true;

  const children = instance.render();

  t.is(children.type, 'div');
});

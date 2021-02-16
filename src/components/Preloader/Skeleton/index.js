import React from 'react';
import PropTypes from 'prop-types';
import Skeleton from 'antd/lib/skeleton';
import 'antd/lib/skeleton/style/index.css';

const Wait = ({ show, active, rows, title }) => {
  if (!show) return null;

  return <Skeleton active={active} paragraph={{ rows }} title={title} />;
};

Wait.propTypes = {
  show: PropTypes.bool,
  active: PropTypes.bool,
  rows: PropTypes.number,
  title: PropTypes.bool
};

Wait.defaultProps = {
  show: true,
  active: true,
  rows: 5,
  title: false
};

Wait.displayName = 'Wait';

export { Wait };

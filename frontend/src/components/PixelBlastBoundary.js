import React from 'react';

class PixelBlastBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PixelBlastBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default PixelBlastBoundary;

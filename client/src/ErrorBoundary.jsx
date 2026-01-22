import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, color: 'red', border: '1px solid red', margin: 20, backgroundColor: '#fff0f0' }}>
                    <h1>Something went wrong!</h1>
                    <h3>Error:</h3>
                    <pre style={{ whiteSpace: 'pre-wrap', color: '#d32f2f' }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <h3>Stack Trace:</h3>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8em', color: '#555' }}>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

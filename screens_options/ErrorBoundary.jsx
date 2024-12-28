import React from "react";
import { View, Text } from "react-native";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to indicate an error occurred
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log error details or send them to an external service
    console.log("Error caught in ErrorBoundary: ", error, info);
    // Example: Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, color: "red", marginBottom: 10 }}>
            An error occurred. Please try again later.
          </Text>
          <Text style={{ fontSize: 14, color: "gray" }}>Error details: {this.state.error?.toString()}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

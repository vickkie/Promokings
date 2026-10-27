import React from "react";
import renderer from "react-test-renderer";
import LoginPage from "../screens/LoginPage";
import { AuthContext } from "../components/auth/AuthContext";

const navigation = { navigate: jest.fn(), replace: jest.fn(), goBack: jest.fn(), dispatch: jest.fn() };

const renderLogin = (role = "customer") =>
  renderer.create(
    <AuthContext.Provider value={{ login: jest.fn(async () => true), getRole: () => role, hasRole: (r) => r === role }}>
      <LoginPage navigation={navigation} />
    </AuthContext.Provider>
  );

test("LoginPage renders for the customer audience", () => {
  const tree = renderLogin("customer");
  expect(tree.toJSON()).toBeTruthy();
});

test("LoginPage renders for the staff audience", () => {
  const tree = renderLogin("staff");
  expect(tree.toJSON()).toBeTruthy();
});

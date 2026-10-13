export default {
  // Catch invalid CSS and mistakes without enforcing a different formatting style.
  extends: ['stylelint-config-recommended'],
  rules: {
    // Theme/state rules are intentionally grouped; order across unrelated
    // components is not a reliable specificity check for this stylesheet.
    'no-descending-specificity': null
  }
};

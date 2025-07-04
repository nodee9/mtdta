// Form handling utilities for MMX extension

/**
 * Fill a form field with the given value
 * @param {HTMLElement} formElement - The form element
 * @param {string} fieldName - Name of the field
 * @param {string} value - Value to set
 * @param {boolean} triggerEvents - Whether to trigger input/change events
 */
function fillFormField(formElement, fieldName, value, triggerEvents = true) {
  if (!formElement || !fieldName) return false;
  
  // Try different selectors to find the field
  const selectors = [
    `[name="${fieldName}"]`,
    `[id="${fieldName}"]`,
    `[data-testid="${fieldName}"]`,
    `#${fieldName}`,
    `input[name*="${fieldName}" i]`,
    `textarea[name*="${fieldName}" i]`,
    `select[name*="${fieldName}" i]`
  ];
  
  let field = null;
  
  // Try each selector until we find a match
  for (const selector of selectors) {
    field = formElement.querySelector(selector);
    if (field) break;
  }
  
  if (!field) return false;
  
  try {
    // Handle different field types
    const tagName = field.tagName.toLowerCase();
    const type = field.type ? field.type.toLowerCase() : '';
    
    if (tagName === 'input' && (type === 'text' || type === 'hidden' || type === 'email' || !type)) {
      field.value = value;
    } 
    else if (tagName === 'textarea') {
      field.value = value;
    }
    else if (tagName === 'select') {
      // Try to find and select an option by text
      const options = Array.from(field.options);
      const matchingOption = options.find(opt => 
        opt.text.toLowerCase().includes(value.toLowerCase())
      );
      
      if (matchingOption) {
        matchingOption.selected = true;
      } else {
        // Fallback to setting by value
        field.value = value;
      }
    }
    else if (tagName === 'input' && (type === 'checkbox' || type === 'radio')) {
      if (field.value === value || field.value === 'on') {
        field.checked = true;
      }
    }
    
    // Trigger events if needed
    if (triggerEvents) {
      const eventTypes = ['input', 'change', 'blur'];
      eventTypes.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        field.dispatchEvent(event);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error filling form field:', error);
    return false;
  }
}

/**
 * Get form data as a key-value object
 * @param {HTMLElement} formElement - The form element
 * @returns {Object} - Form data as key-value pairs
 */
function getFormData(formElement) {
  if (!formElement || !formElement.elements) return {};
  
  const formData = {};
  const elements = formElement.elements;
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const name = element.name || element.id;
    
    if (!name) continue;
    
    const tagName = element.tagName.toLowerCase();
    const type = element.type ? element.type.toLowerCase() : '';
    
    if (tagName === 'input' && (type === 'checkbox' || type === 'radio')) {
      if (element.checked) {
        formData[name] = element.value || true;
      }
    } 
    else if (tagName === 'select' || tagName === 'textarea' || tagName === 'input') {
      formData[name] = element.value;
    }
  }
  
  return formData;
}

/**
 * Find form elements that match common patterns
 * @param {HTMLElement} container - Container to search within
 * @returns {Object} - Object with common form fields
 */
function findCommonFormFields(container) {
  if (!container) return {};
  
  // Common field patterns
  const fieldPatterns = {
    title: ['title', 'name', 'headline', 'caption'],
    description: ['description', 'desc', 'summary', 'caption'],
    keywords: ['keywords', 'tags', 'categories', 'tags-input'],
    category: ['category', 'type', 'section', 'genre'],
    submit: ['submit', 'save', 'upload', 'publish']
  };
  
  const foundFields = {};
  
  // Search for each field type
  for (const [fieldType, patterns] of Object.entries(fieldPatterns)) {
    for (const pattern of patterns) {
      // Try different selectors
      const selectors = [
        `[name*="${pattern}" i]`,
        `[id*="${pattern}" i]`,
        `[data-testid*="${pattern}" i]`,
        `[class*="${pattern}" i]`,
        `[placeholder*="${pattern}" i]`,
        `[aria-label*="${pattern}" i]`
      ];
      
      for (const selector of selectors) {
        const element = container.querySelector(selector);
        if (element && !foundFields[fieldType]) {
          foundFields[fieldType] = element;
          break;
        }
      }
      
      if (foundFields[fieldType]) break;
    }
  }
  
  return foundFields;
}

/**
 * Submit a form
 * @param {HTMLElement} formElement - The form element to submit
 * @returns {boolean} - Whether submission was successful
 */
function submitForm(formElement) {
  if (!formElement) return false;
  
  try {
    // Try standard form submission
    if (typeof formElement.submit === 'function') {
      formElement.submit();
      return true;
    }
    
    // Try clicking submit button if form.submit() doesn't work
    const submitButton = formElement.querySelector('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      submitButton.click();
      return true;
    }
    
    // Try dispatching a submit event
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const submitted = formElement.dispatchEvent(submitEvent);
    
    return submitted;
  } catch (error) {
    console.error('Error submitting form:', error);
    return false;
  }
}

export {
  fillFormField,
  getFormData,
  findCommonFormFields,
  submitForm
};

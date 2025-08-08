import os
import json
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoAlertPresentException, TimeoutException
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from pydantic import BaseModel
from typing import Optional, Dict, Any

# Constants
APPLICATION_STATUS_URL = "https://iprsearch.ipindia.gov.in/PublicSearch/PublicationSearch/ApplicationStatus"
CAPTCHA_URL = "https://iprsearch.ipindia.gov.in/PublicSearch/Captcha/CaptchaAudio"
MAX_RETRIES = 3
RETRY_DELAY = 5

class ApplicationResponse(BaseModel):
    "Application Number": str
    "Applicant Name": Optional[str] = None
    "Application Type": Optional[str] = None
    "Date of Filing": Optional[str] = None
    "Title of Invention": Optional[str] = None
    "Field of Invention": Optional[str] = None
    "Email (As Per Record)": Optional[str] = None
    "Additional Email (As Per Record)": Optional[str] = None
    "Email (Updated Online)": Optional[str] = None
    "PCT International Application Number": Optional[str] = None
    "PCT International Filing Date": Optional[str] = None
    "Priority Date": Optional[str] = None
    "Request for Examination Date": Optional[str] = None
    "Publication Date (U/S 11A)": Optional[str] = None
    "Application Status": Optional[str] = None
    error: bool = False
    errorMessage: Optional[str] = None

def parse_date(date_string):
    if not date_string:
        return None
    try:
        return datetime.strptime(date_string, "%d/%m/%Y").date().strftime("%d/%m/%Y")
    except ValueError:
        return date_string

def setup_driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-setuid-sandbox")
    options.add_argument("--disable-software-rasterizer")
    options.add_argument("--disable-extensions")
    options.add_argument("--single-process")
    options.add_argument("--disable-dev-shm-usage")
    options.page_load_strategy = 'eager'
    
    # Use ChromeDriverManager to get the appropriate ChromeDriver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    wait = WebDriverWait(driver, 15)
    return driver, wait

def get_captcha_text(driver, wait):
    driver.execute_script(f"window.open('{CAPTCHA_URL}','_blank');")
    driver.switch_to.window(driver.window_handles[-1])
    
    element2 = wait.until(EC.presence_of_element_located((By.TAG_NAME, "pre")))
    captcha = element2.text
    json_data = json.loads(captcha)
    
    driver.close()
    driver.switch_to.window(driver.window_handles[0])
    
    return json_data["CaptchaImageText"]

def extract_application_data(driver, wait, application_number):
    try:
        body = wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        tables = body.find_elements(By.TAG_NAME, "table")

        if tables:
            data = {"Application Number": application_number}
            for table in tables[:2]:
                extract_table_data(table, data)
            return data
        return None

    except TimeoutException:
        return None
    except Exception as e:
        print(f"Error extracting data for application {application_number}: {str(e)}")
        return None

def extract_table_data(table, data):
    rows = table.find_elements(By.TAG_NAME, "tr")
    for row in rows:
        columns = row.find_elements(By.TAG_NAME, "td")
        if len(columns) == 2:
            key = columns[0].text.strip()
            value = columns[1].text.strip()
            if key == "APPLICANT NAME":
                data["Applicant Name"] = value
            elif key == "APPLICATION TYPE":
                data["Application Type"] = value
            elif key == "DATE OF FILING":
                data["Date of Filing"] = parse_date(value)
            elif key == "TITLE OF INVENTION":
                data["Title of Invention"] = value
            elif key == "FIELD OF INVENTION":
                data["Field of Invention"] = value
            elif key == "E-MAIL (As Per Record)":
                data["Email (As Per Record)"] = value
            elif key == "ADDITIONAL-EMAIL (As Per Record)":
                data["Additional Email (As Per Record)"] = value
            elif key == "E-MAIL (UPDATED Online)":
                data["Email (Updated Online)"] = value
            elif key == "PCT INTERNATIONAL APPLICATION NUMBER":
                data["PCT International Application Number"] = value
            elif key == "PCT INTERNATIONAL FILING DATE":
                data["PCT International Filing Date"] = parse_date(value)
            elif key == "PRIORITY DATE":
                data["Priority Date"] = parse_date(value)
            elif key == "REQUEST FOR EXAMINATION DATE":
                data["Request for Examination Date"] = parse_date(value)
            elif key == "PUBLICATION DATE (U/S 11A)":
                data["Publication Date (U/S 11A)"] = parse_date(value)
            elif key == "APPLICATION STATUS":
                data["Application Status"] = value

def process_application_number(application_number, retry_count=0):
    driver, wait = setup_driver()
    try:
        driver.get(APPLICATION_STATUS_URL)

        try:
            alert = driver.switch_to.alert
            alert.accept()
        except NoAlertPresentException:
            pass

        element1 = wait.until(EC.element_to_be_clickable((By.ID, "ApplicationNumber")))
        element1.clear()
        element1.send_keys(application_number)
        time.sleep(0.5)

        captcha_text = get_captcha_text(driver, wait)
        input_field1 = wait.until(EC.element_to_be_clickable((By.ID, "CaptchaText")))
        input_field1.clear()
        input_field1.send_keys(captcha_text)
        time.sleep(0.5)

        submit_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@value='Show Status']")))
        submit_button.click()

        data = extract_application_data(driver, wait, application_number)
        if data is None and retry_count < MAX_RETRIES:
            print(f"\nRetrying application {application_number} (Attempt {retry_count + 1}/{MAX_RETRIES})")
            time.sleep(RETRY_DELAY)
            return process_application_number(application_number, retry_count + 1)
        
        if data is None:
            return ApplicationResponse(
                **{"Application Number": application_number},
                error=True,
                errorMessage="Failed to fetch application data"
            )
        
        return ApplicationResponse(**data)

    except Exception as e:
        print(f"\nError processing application number {application_number}: {str(e)}")
        if retry_count < MAX_RETRIES:
            print(f"Retrying application {application_number} (Attempt {retry_count + 1}/{MAX_RETRIES})")
            time.sleep(RETRY_DELAY)
            return process_application_number(application_number, retry_count + 1)
        
        return ApplicationResponse(
            **{"Application Number": application_number},
            error=True,
            errorMessage=str(e)
        )
    finally:
        driver.quit()

def handler(event, context):
    try:
        # Parse the request body
        body = json.loads(event.get('body', '{}'))
        application_number = body.get('applicationNumber')
        
        if not application_number:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                'body': json.dumps({'error': 'Application number is required'})
            }
        
        # Process the application
        result = process_application_number(application_number)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': result.json()
        }
        
    except Exception as e:
        print(f"Error in handler: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': json.dumps({'error': 'Internal server error'})
        }

# For local testing
if __name__ == "__main__":
    class MockEvent:
        def __init__(self, body):
            self.body = body
    
    class MockContext:
        pass
    
    # Test with a sample application number
    test_event = MockEvent(json.dumps({"applicationNumber": "20231234567"}))
    result = handler(test_event, MockContext())
    print(result)
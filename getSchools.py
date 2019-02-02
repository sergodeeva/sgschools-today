import requests
import pandas as pd
from bs4 import BeautifulSoup

link = 'https://www.moe.gov.sg/admissions/primary-one-registration/information-on-primary-schools/listing-by-planning-area'

html = requests.get(link).text

soup = BeautifulSoup(html, 'html.parser')
res = soup.select('table.table2 a')

schools_list = []

for r in res:
    schools_list.append(r.text)

df = pd.DataFrame({'school_name': schools_list})
df.to_csv("schools_list.csv", index=False, encoding='utf-8-sig')

import requests
from bs4 import BeautifulSoup
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from uuid import uuid4
import time



# Configuration
MAIN_SITE_URLS = [
    "https://www.h-brs.de/de",  # German
    "https://www.h-brs.de/en",  # English
]
FAQ_AND_DIRECT_LINKS = [
    "https://www.h-brs.de/de/faq-bibliothek",
    "https://www.h-brs.de/en/bib/faq-library",
    "https://www.h-brs.de/en/bib/faqs-about-remote-access",
    "https://www.h-brs.de/de/bib/obrs-faq",
    "https://www.h-brs.de/en/bib/obrs-faq",
    "https://www.h-brs.de/en/bib/faq-switching-citavi-zotero",
    "https://www.h-brs.de/de/bib/faq-vg-wort",
    "https://faq.infcs.de",
    "https://faq.infcs.de/en/passwords/",
    "https://faq.infcs.de/e-mail/",
    "https://faq.infcs.de/servicepoint/",
    "https://www.h-brs.de/en/faq-student-it-service",
    "https://www.h-brs.de/de/its/faq-fuer-studierende",
    "https://www.h-brs.de/en/its/hochschul-accounts-fuer-studierende",
    "https://www.h-brs.de/en/its/faq-staff-it-service",
    "https://www.h-brs.de/de/its/anleitungen-und-faqs-fuer-beschaeftigte",
    "https://asta-hs-brs.de/en_wip/faq/",
    "https://asta-hs-brs.de/en_wip/",
    "https://asta-hs-brs.de/sport/",
    "https://www.h-brs.de/de/anna/haeufig-gestellte-fragen-faq-fuer-studierende-im-fachbereich-angewandte-naturwissenschaften",
    "https://www.h-brs.de/de/anna/incomings/frequently-asked-questions",
    "https://www.h-brs.de/en/wiwi/it-faq",
    "https://www.h-brs.de/de/bewerbung-partnerhochschulen-faq",
    "https://www.h-brs.de/en/application-partner-universities-faq",
    "https://www.fib.upc.edu/pdf/mobilitat/keydata/D_ST-AUGU02.pdf",
    "https://www.h-brs.de/en/spz/faq-language-centre",
    "https://faq.infcs.de/en/wifi-eduroam/h-brs/",
    "https://www.h-brs.de/de/studium-verantwortung",
    "https://unternehmenstag.de/fuer-unternehmen/fragen-unternehmen/",
    "https://lea.hochschule-bonn-rhein-sieg.de/ilias.php?cmdClass=ilpasswordassistancegui&cmdNode=11a%3Auk&baseClass=ilStartUpGUI&lang=de",
]
CHROMA_PATH = "chroma_db"

# Set crawl limits
MAIN_SITE_MAX_PAGES = 300
FAQ_LINKS_MAX_PAGES = 1  # Only fetch each direct link once


def is_internal_link(href):
    if not href:
        return False
    return href.startswith("/de") or href.startswith("/en")

def full_url(base, href):
    if href.startswith("http"):
        return href
    if href.startswith("/"):
        return f"https://www.h-brs.de{href}"
    return base.rstrip("/") + "/" + href

def crawl_site(start_urls, max_pages=100):
    visited = set()
    to_visit = list(start_urls)
    documents = []
    while to_visit and len(visited) < max_pages:
        url = to_visit.pop(0)
        if url in visited:
            continue
        try:
            resp = requests.get(url, timeout=10)
            soup = BeautifulSoup(resp.text, "html.parser")
            texts = soup.stripped_strings
            text = "\n".join(texts)
            documents.append(Document(page_content=text, metadata={"source": url}))
            visited.add(url)
            # Find new links
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if is_internal_link(href):
                    abs_url = full_url("https://www.h-brs.de", href)
                    if abs_url not in visited and abs_url not in to_visit:
                        to_visit.append(abs_url)
            time.sleep(0.5)  # Be polite
        except Exception as e:
            print(f"Failed to fetch {url}: {e}")
    return documents


# Crawl main site deeply
print("Crawling main site URLs (deep crawl)...")
documents = crawl_site(MAIN_SITE_URLS, max_pages=MAIN_SITE_MAX_PAGES)
print(f"Crawled {len(documents)} pages from main site.")

# Fetch FAQ and direct links (shallow, just the page itself)
print("Fetching FAQ and direct links...")
faq_documents = crawl_site(FAQ_AND_DIRECT_LINKS, max_pages=FAQ_LINKS_MAX_PAGES)
print(f"Fetched {len(faq_documents)} FAQ/direct pages.")

# Combine all documents
documents.extend(faq_documents)
print(f"Total documents: {len(documents)}")

# Split text into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,
    chunk_overlap=100,
    length_function=len,
    is_separator_regex=False,
)
chunks = text_splitter.split_documents(documents)

# Embeddings and vector store
embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_store = Chroma(
    collection_name="example_collection",
    embedding_function=embeddings_model,
    persist_directory=CHROMA_PATH,
)


# Chroma batch size workaround
uuids = [str(uuid4()) for _ in range(len(chunks))]
BATCH_SIZE = 5000
for i in range(0, len(chunks), BATCH_SIZE):
    batch_chunks = chunks[i:i+BATCH_SIZE]
    batch_uuids = uuids[i:i+BATCH_SIZE]
    vector_store.add_documents(documents=batch_chunks, ids=batch_uuids)
print("Ingestion complete.")






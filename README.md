# Textmaster extension for Salesforce Commerce Cloud

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

TextMaster is the world’s first global translation solution that is available entirely online. Thanks to a network of expert translators, cutting-edge technologies and a range of value-added services, TextMaster enables companies to streamline the translation of their content in over 50 languages and areas of expertise.


# Description
***

The Textmaster extension with Salesforce Commerce Cloud allows you to easily translate your content within SFCC to a large quantity of languages with a simple mass edit process:
- Products
- Categories
- Content assets*

_*Note: Content assets cannot be extracted and sent for translation if they don't belong to a library folder._

# Features
***

  - Certified Commerce Cloud Intergration
  - All content types (product, categories, content assets) and attributes handled
  - Advanced filtering and selection of items
  - Quote with live translation memory analysis
  - Seamless and automatic translation workflow
  - Real-time status tracking

# Requirements
***

We suggest the following steps in order for the integration to go as smoothly as possible:

### Create a TextMaster account 

Creating your account on [TextMaster](https://textmaster.com) is totally free. You can create one [here](https://app.textmaster.com/sign_in).

### Add credits to your account

You won't be able to launch a translation request without credits. Please make sure that you have enough credits on your account, otherwise the request you're sending will remain in creation.

### Create an API template in the language pair of your choice

The API template is like a project model where you can pre-select all the translation options of your choice (translation memory, glossaries, favorite authors, expertise, etc.). This template is necessary for creating a translation request. You need to create one per language pair. Once you're done with it, you won't have to select your options every time you want to send an item for translation.


_Note: For the purpose of your tests, we also have a test environment at your disposal where you can test the whole translation workflow. Please [contact us](integrations@textmaster.com) if you are interested._

# Compatibility
***

The cartridge is based on JS controllers, new job framework and on SiteGenesis version 18.9. It is also compatible with SFRA.

# How it works
***

### Components
The TextMaster menu will appear under the section 'Merchant Tools' of each site where the module was setup. It contains 4 main tabs: 
- _Send content for translation to TextMaster_: this tab allows you to initiate a content search, select your content and send it for translation
- _Translation dashboard_: the dashboard allows you to vizualize all the items that were sent for translation and follow their status
- _API setup_: that's where you will enter your API key and API secret to connect SFCC to your TextMaster account
- _Attribute setup_: this is where you register the default attributes that will be sent for translation every time you create a new translation request. Don't worry, you will still be able to select more during the project creation phase.

### Setup
**1  - Authentication with TextMaster**
- Go to *TextMaster > API setup* 
- Under 'API environment', select 'Live'
- Enter your API and API secret: you will find them on your TextMaster account [here](https://app.textmaster.com/clients/api_info)
- Enter the ID of your catalog master
- If your environment is password protected, please enter this password in the field 'Storefront protection password'

**2 - Attribute setup**
- Go to *TextMaster > Attribute setup*
- Select the content type of your choice
- Select all the attributes that you wish to send for translation by default

### Creating a translation project
- Go to *TextMaster > Send content for translation to TextMaster* 
- Initiate a content search: choose your content type, your catalog (for products and categories), categories, source and target languages and launch the search
- Select your content then go next
- Select the API template you previously created (please refer to the 'Requirements' part)
- Place order

The project will be immediately created on TextMaster and you will receive an instant quote before launching the project on TextMaster! 

Once launched, you will be able to follow the status of your translation projects directly from Salesforce Commerce Cloud by going to **TextMaster > Translation dashboard**!

# Installation
***
### Step 1
First step is to upload all the cartridges to active code version of the SFCC sandbox, then for each site, go to **Demandware > Administration > Manage Sites > (site) > Settings > Cartridges** input field add cartridge names as follows:
- For SFRA based sites: int_textmaster_sfra:int_textmaster_core in front of base cartridge path
- For Business Manager site: bm_textmaster:int_textmaster_core
- For SiteGenesis based sites: int_textmaster_controllers:int_textmaster_core in front of default storefront cartridges

### Step 2
In the cartridge bundle, inside metadata folder compress textmaster-meta-import folder to generate textmaster-meta-import.zip file and import it through Administration > Site Development > Site Import & Export

### Step 3
The jobs need to be replicated for all the sites.
For example, the job TextMasterAskForQuoteRefArch is replicated so that the new job will have an ID with the format TextMasterAskForQuote<siteID>. If the site ID is XyZ, the new job will be "TextMasterAskForQuoteXyZ".  Under the "Job Steps" for the job, the scope must be the site ID, say "XyZ" if site ID is XyZ and edit the Job Step id with siteId.
Follow the same steps for other jobs to replicate for all sites.

### Step 4
For each site, set the values below manually in Site preferences > Custom preferences > TextMaster. All other values need to be configured through API Setup page in our TextMaster user interface.
- Site Library Type: Library type of your Site - Private OR Shared
- OCAPI Client ID: Client ID of your OCAPI account in account.demandware.com
- OCAPI Client Password: Client Password of your OCAPI account in account.demandware.com
- SiteGenesis Controller Cartridge: the cartridge name of SiteGenesis storefront controllers has to be entered in relevant Site Preference to get access to default controller files from bm_textmaster cartridge.

### Step 5
In **Administration > Site Development > Open Commerce API Settings** select "Data" in 'Select Type' and 'Global (organization-wide)' in 'Select context'.
In the JSON content, ensure that the value for key "client_id" corresponds to your client ID in account.demandware.com. In the settings JSON content, inside "resources" array, add the following value:
```sh
,{
"resource_id":"/jobs/*/executions",
"methods":["post"],
"read_attributes":"(**)",
"write_attributes":"(**)"
},
{
 "resource_id":"/locale_info/locales",
"methods":["get"],
"read_attributes":"(**)",
"write_attributes":"(**)"
}
```
Keep Client ID and Password for OCAPI in Site Preference

Once done, enable the cartridge as follows: go to Administration > Organization > Roles > Administrator, go in the tab Business Manager Modules, find TextMaster and click on the checkbox to enable it.

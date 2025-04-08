---
layout: post
title: "How to Link a Custom Domain to GitHub Pages"
date: 2023-05-24
author: "Vladislav Kochetov"
categories: [ post ]
tags: [github, github-pages, domains, custom-domain, website, osdc]
---

GitHub Pages is a fantastic hosting service offered by GitHub, allowing users to create and host static websites directly from their repositories. While GitHub provides a default domain for your GitHub Pages site, linking a custom domain to your GitHub Pages repository can give your website a more professional and personalized touch. In this article, we will guide you through linking a custom domain to your GitHub Pages site, from start to finish.

## Step 1: Choose and Purchase a Custom Domain
The first step in linking a custom domain to GitHub Pages is selecting and purchasing a domain name. Various domain registrars like [GoDaddy](https://www.godaddy.com/), [Namecheap](https://www.namecheap.com/), or [Google Domains](https://domains.google/) offer domain registration services. Choose a domain name that reflects your website's purpose and is easy to remember. For this guide, we will use the placeholder `yourdomain.com`.

## Step 2: Configure DNS Settings
Once you have purchased your custom domain, you need to configure the DNS settings to point to GitHub Pages. The process may vary slightly depending on your domain registrar, but the overall steps remain similar. Here's a more detailed guide to help you through the process:

1. Log in to your domain registrar's website and navigate to the DNS management section. This section is typically labeled as "DNS Management," "DNS Settings," or "Domain Management."

2. Locate the DNS settings for your domain. You should see a table or list of DNS records associated with your domain.

3. Add a new record by selecting the option to create a new record. The exact wording or button may differ based on your registrar's interface.

4. Create a `CNAME` record. In the "Host" or "Name" field, enter the desired subdomain you want to link to GitHub Pages. For example, if you want to link the subdomain **<u>`www.yourdomain.com`</u>**, enter `www` in the host field.

5. In the "Value," "Points to," or "Destination" field, enter your GitHub Pages repository's URL, which follows the format **`username.github.io`**. Replace "username" with your actual GitHub username.

6. Save the `CNAME` record. The specific button to save or add the record may vary depending on your domain registrar. It is typically labeled as "Save," "Add Record," or "Submit."

   Here's an example of how the `CNAME` record might look in the DNS
   settings:

   > Host: www<br>
   > Value: username.github.io

   ![CNAME record example](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6coa2c2lvhf3y02gdtxn.png)

7. (Optional) If you want to link your root domain (**`yourdomain.com`**) directly to GitHub Pages, you'll need to configure an A record as well. Look for an option to add a new A record and follow these steps:

    1. Leave the "Host" or "Name" field blank or enter the `@` symbol
    2. In the "Value" or "Points to" field, enter one of GitHub's static IP addresses: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, or `185.199.111.153`
    3. Save the A record

   <br>Here's an example of how the A record might look in the DNS settings:

   > Host: @<br>
   > Value: 185.199.108.153

   Note: The `@` symbol represents the root domain itself
   (`yourdomain.com`).

8. Save the changes to the DNS settings. This typically involves clicking a "Save" or "Apply" button.

## Step 3: Add CNAME File to Your GitHub Pages Repository

Another way to link your custom domain to your GitHub Pages site is by adding a `CNAME` file directly in your repository. This method is useful if you prefer managing the custom domain configuration within your repository itself. Follow these steps:

1. In your GitHub Pages repository, create a new file named `CNAME`. Make sure the filename is in uppercase.

2. Open the `CNAME` file and enter your custom domain (`yourdomain.com`) in plain text.

3. Save the `CNAME` file.

4. Commit the changes to your repository, including the newly created `CNAME` file.

GitHub Pages will automatically recognize the `CNAME` file and associate your custom domain with the repository.

Please note that using the `CNAME` file method will only work if you have already configured the DNS settings for your custom domain as described in earlier steps.

> Note: Remember to allow some time for the changes to propagate globally. It may take up to 24 to 48 hours for the DNS changes to take full effect.

## Step 4: Add Custom Domain in GitHub Pages Settings

> Note: A CNAME file in your repository file does not automatically add or remove a custom domain. Instead, you must configure the custom domain through your repository settings or through the API. For more information, see [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain) and the [Pages API reference documentation](https://docs.github.com/en/rest/pages?apiVersion=2022-11-28#update-information-about-a-github-pages-site).

To add your custom domain in the GitHub Pages settings for your repository, follow these simple steps:

1. Open your GitHub repository and go to the "Settings" tab.

2. Scroll down to the "GitHub Pages" section.

3. In the "Custom domain" field, enter your custom domain (e.g., `yourdomain.com`).

4. Click "Save" to apply the changes.

![GitHub actions Custom Domain section example](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/yvrcybdm588f9snkf2de.png)

GitHub will validate the custom domain and configure the necessary settings. Once the configuration is complete, your custom domain will be associated with your GitHub Pages site.

For more detailed information and troubleshooting tips, refer to the official GitHub documentation:
- [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Troubleshooting custom domains and GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)

Congratulations! You have successfully linked your custom domain (`yourdomain.com`) to your GitHub Pages site using the `CNAME` file within your repository.
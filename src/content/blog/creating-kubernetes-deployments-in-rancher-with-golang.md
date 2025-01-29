---
title: Creating Kubernetes deployments in Rancher with Golang
description: In this article, I detail my process of using Golang and Kubernetes to deploy custom websites with unique domains on a DigitalOcean droplet managed by Rancher. I cover the challenges I faced with routing TLS certificates and creating ingresses for custom domains, and explain how I utilized the `Kubernetes/client-go` package to automate deployment and service management, ensuring efficient and scalable hosting solutions for users with both subdomains and custom domain needs.
pubDatetime: 2025-01-29
featured: true
---

## I run a website called Reddex

Reddex allows its user to create there own custom websites to show off their content as it relates to their narration youtube channels. I won’t get into the weeds about what Reddex does, even though it’s quite awesome.
In Reddex you have your own custom site and the ability to bring your own domain.

I host this website on a DigitalOcean droplet inside a k3s cluster with Rancher on top so I can effectively manage it.
I needed a way for someone to bring their own domain, get free TLS and their own pod running the image I created of the custom website.

This is impossible to do in my estimation if you’re trying to have a one-size fits all approach when using deployments, ingresses, and services.

## How I route wildcard subdomains and custom domains

One of the issues I encountered was, I couldn’t create TLS certificates for their custom domain because any domain could be making a request at any time. And it’d be the opposite of scalable to do it by hand.

Another issue that came into play was actually being able to create the necessary ingresses to route their domain to their own pod. However, it works the opposite for those who aren’t bring their own domain. This proves quite easy and the one-size fits all approach does work for this specific scenario.

If you don’t bring your own domain, you’re given a subdomain which your website hosted by Reddex will sit on; something like “mydomain.reddex.app.”

This is easy because in Traefik, which Rancher uses, because I can create an Ingress that listens for requests on a wildcard like “\*.reddex.app” which then lets me route all those requests to a single service.

While that part is easy, the tricky part was how do I do this for a custom domain? It took sometime to figure out, but we eventually got there.

Long story short:

- a user points their domain to my static IP which points to my droplet
- they add their custom domain in the UI on their dashboard of Reddex
- it creates a database value and at the same time it fires off an http request to my internal Go API with the name of their domain

## How I used Golang to spin up and down custom services

In the end, I needed a way to automatically create and teardown these custom instances. The previous list is a general overview of how it works.

> I won’t share the code here because there’s a lot of it, but if you’re interested, you can head over to the [Github repo](https://github.com/tyrelchambers/k8s-ingress-generator) to check it out for yourself.

I used this package called `Kubernetes/client-go` to interact with my k3s cluster. All the Golang API is doing, is running some `kubectl` commands and applying ad-hoc files that I create using Golang. You can check out the repo [here](https://github.com/kubernetes/client-go).

When a request comes in to my API, it grabs the domain name and starts scaffolding the required deployments and services.

I love this approach because it allows me to easily troubleshoot issues and do rollout restarts for any given individual user. Since each user has their own deployment, pod, service and ingress, I have granular control over their workflow. If anything goes wrong, it affects one user and not them all.

I set up each individual instance (deployment, service etc.) with labels to denote which domain the instance belongs too. Another handy tool that I noticed in this library is the ability to generate random names for these services. It allows you to specify a prefix (or suffix the choice is yours) after which, or before, it’ll add a random string of characters, making them all unique.

I originally tried to be explicit with their naming for explicit’s sake, but there is a rather limited number of characters you can add to any given instance’s name. At the end of the day, random names work fine.

To overcome this issue, I label each instance with the domain it belongs to. This allows me to search all deployments, ingresses, services, and pods by label, and using Rancher, I can see what any given instance belongs to at a glance.

I use this labelling method as the way to teardown instances too.

It’s surprisingly quick. By the time you add your own domain, the request is sent to the Golang API, your custom services are spun up, everything is functional before you can navigate to your custom site.

Each service is also independent of one another. If a service fails to teardown for example, it won’t stop the other instances from tearing down. If something happens and the deployment errors out while tearing down, the service and ingress will continue to teardown on their own.

While this is incredibly helpful, I ran into another issue. All these custom services (including the service generator - Go API) exist in their own namespace in k3s. This offers me the opportunity to segregate them from my default namespace which reduces clutter in the UI.

I needed a way to restart all of these deployments for example if I release an update to the custom website Docker image, I need to tell Kubernetes to perform a rollout restart. This is easy enough to do in Rancher, but again, less than scalable.

## Using Bash to restart the custom deployments

I created a bash script to do this for me.

```
while read -r deployment; do
  kubectl rollout restart deployment $deployment --namespace dynamic-sites
done < <(kubectl get deployments --namespace dynamic-sites | tail -n +2 | grep -vE "k8s-ingressor-deploy" >
```

This command runs the `get deployments` kubectl command and lists them in the terminal. You could do this manually via these commands if you wanted to.

It gets all the deployments for a given namespace and prints them to the console. It creates an ad-hoc file (but not a real file, this only exists in the context of the terminal) and loops over the given results.

I’m not a bash expert, I don’t even know the first thing about bash, so thank you ChatGPT.

This line `tail -n +2 | grep -vE "k8s-ingressor-deploy"` is fun. It prints out the text starting at the second row. This is required because when you run the command `kubectl get deployments --namespace dynamic-sites` on its own, you’ll see headers such as “name.”

Running the tail command move our pointer to the second line, effectively skipping this header and not including it in our command.

The grep portion tells us to ignore the value in the string (this is hardcoded as such as a POC).

The rest of the command is looping over each individual output of the kubectl command and executing rollouts on all of the services it finds.

This is all automated. In my Github action for my Custom Site repo, as part of the deployment, I SSH into my server and run the rollout command for the wildcard deployment (for websites that don’t have their own domain), then I run this bash file which pulls and rollouts the rest of the custom website images.

I’m thrilled at how this turned out. I was uncertain how this is even possible, before I started. I was staring at a mountain without a clue on how to start climbing. But, before long, after a little chatting with ChatGPT, and after mostly thinking about this, I came up with this solution. Now, I’m basically Squarespace, or GoDaddy.

Anyway, that’s all. I hope you found it useful. I am very proud of this setup.

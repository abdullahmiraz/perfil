import demoFixture from "../../../fixtures/profiles/demo.json";
import contactFormHtml from "../../../fixtures/forms/contact-form.html?raw";
import { profileFromFixture } from "@/lib/fixtures";

export const harnessProfile = profileFromFixture(demoFixture);
export const harnessFormHtml = contactFormHtml;

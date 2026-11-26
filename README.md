![Web and Systems Lab](assets/banner.svg)

# Web and Systems Lab

A collection of smaller applications and algorithm implementations, each with its own setup and limitations.

**Node.js · Express · SQL · Flask · JavaScript · C++**

| Project | Focus | Status |
| --- | --- | --- |
| [Event manager](event-manager/) | Express/EJS, SQLite, organizer and attendee routes | Six HTTP page/asset checks passed |
| [Movie explorer](movie-explorer/) | Relational cast/crew queries and Express pages | MySQL prototype; source dataset required |
| [Application assistant](application-assistant/) | Flask accounts, text statistics and a toy classifier | Experimental prototype; no admissions predictions |
| [Postfix calculator](postfix-calculator/) | Stack evaluation, variables and arithmetic | Dependency-free Node CLI |
| [Weather analysis](weather-analysis/) | C++ parsing, summaries, text plots and prediction exercise | Compile checked; historical CSV required |
| [Cipher demonstration](cipher-demo/) | Alphabetic modular encryption/decryption | Small educational algorithm, not secure cryptography |

## Choose a project

There is no root install command: applications have independent runtimes. Open the local README in the relevant folder. Start with the postfix calculator for a fast, dependency-free example, or the event manager for a small database-backed application.

## Preparation changes

Embedded database/session settings were replaced with local configuration, private database/environment files were excluded, and database reset now requires explicit intent. The application-assistant output is labelled synthetic because its fallback classifier uses only three invented training records. Its past-participle heuristic is labelled accurately and is not a validated grammar assessment.

## Scope

These projects add software and algorithm breadth beside the larger AI projects. They are not deployed public services. Authentication, authorization, CSRF protection, validation, concurrency and deployment hardening need separate review before any internet deployment. No client documents, personal recordings or real applicant records are included.


## Source and maintenance

Recovered implementations from Shahzaib Naeem’s project backups, maintained for public review. See [SOURCES.md](SOURCES.md) for origins, third-party components and preparation changes. Run records describe software checks, not independently validated research outcomes.

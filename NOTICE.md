# Third-party content

Ekin's **source code** is MIT licensed (see `LICENSE`). Its **exercise data** is not all
under the same terms, and this file records what applies to what.

## free-exercise-db — public domain

`src/data/exercises.json` is generated from
[free-exercise-db](https://github.com/yuhonas/free-exercise-db), released under the
[Unlicense](https://unlicense.org/) (public domain). Exercise images are served from that
project's repository.

No restrictions.

## wger — CC-BY-SA

`src/data/exercises.wger.json` is imported from [wger](https://wger.de), whose exercise
database is contributed under Creative Commons licences — predominantly
[CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), with some CC-BY-SA 3.0
and CC0 entries.

**These exercises remain under their original licence.** They are kept in a separate file
and merely aggregated with the rest of the catalog at read time; they are not merged into
the public-domain dataset, and including them does not place Ekin's code or the
free-exercise-db data under CC-BY-SA.

What that means in practice:

- **Attribution travels with the content.** Every imported exercise carries a `source`
  object naming its author, the licence, and a link back to the wger page. The app shows
  this on the credits screen.
- **Share-alike applies to adaptations.** Translations we generate of wger text — the
  Basque, Galician, Catalan and Valencian instructions — are adaptations, and are
  published under the same CC-BY-SA licence as the English original they derive from.
- **Images** imported from wger are likewise CC-BY-SA, credited to their individual
  authors.

Authors are credited individually where wger records one; contributions with no recorded
author are credited to "wger contributors".

Re-run `npm run import-wger` to refresh this dataset.

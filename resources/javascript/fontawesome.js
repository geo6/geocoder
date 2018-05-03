import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch'
import { faLanguage } from '@fortawesome/pro-light-svg-icons'

library.add(
  faLanguage,
  faSearch
);

dom.watch();

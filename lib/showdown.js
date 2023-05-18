import showdown from 'showdown';

const mdConverter = new showdown.Converter({
  tables: true,
  completeHTMLDocument: true,
  moreStyling: true,
});

export default mdConverter;

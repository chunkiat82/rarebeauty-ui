const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix GraphQL type imports/references
  if (content.includes('StringType') || 
      content.includes('IntegerType') || 
      content.includes('ObjectType') || 
      content.includes('NonNull') || 
      content.includes('BooleanType') || 
      content.includes('FloatType') || 
      content.includes('ListType')) {

    modified = true;
    
    // Fix require statement
    content = content.replace(/const\s*{\s*([^}]+)\s*}\s*=\s*require\('graphql'\);/g, (match, imports) => {
      // Map old type names to new type names
      const importMap = {
        'ObjectType': 'GraphQLObjectType',
        'StringType': 'GraphQLString',
        'IntegerType': 'GraphQLInt',
        'NonNull': 'GraphQLNonNull',
        'BooleanType': 'GraphQLBoolean',
        'FloatType': 'GraphQLFloat',
        'ListType': 'GraphQLList'
      };
      
      // Process each import
      const newImports = imports.split(',')
        .map(imp => imp.trim())
        .filter(imp => imp.length > 0)
        .map(imp => importMap[imp] || imp);
      
      return `const {\n  ${newImports.join(',\n  ')}\n} = require('graphql');`;
    });
    
    // Fix type references in the code
    content = content.replace(/new\s+NonNull\s*\(/g, 'new GraphQLNonNull(');
    content = content.replace(/new\s+ListType\s*\(/g, 'new GraphQLList(');
    content = content.replace(/new\s+ObjectType\s*\(/g, 'new GraphQLObjectType(');
    content = content.replace(/type:\s*StringType/g, 'type: GraphQLString');
    content = content.replace(/type:\s*IntegerType/g, 'type: GraphQLInt');
    content = content.replace(/type:\s*BooleanType/g, 'type: GraphQLBoolean');
    content = content.replace(/type:\s*FloatType/g, 'type: GraphQLFloat');
    content = content.replace(/type:\s*new\s+ListType\s*\(\s*StringType/g, 'type: new GraphQLList(GraphQLString');
    content = content.replace(/type:\s*new\s+ListType\s*\(\s*IntegerType/g, 'type: new GraphQLList(GraphQLInt');
    content = content.replace(/type:\s*new\s+ListType\s*\(\s*FloatType/g, 'type: new GraphQLList(GraphQLFloat');
    content = content.replace(/type:\s*new\s+ListType\s*\(\s*BooleanType/g, 'type: new GraphQLList(GraphQLBoolean');
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${filePath}`);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

// Process all JavaScript files in src directory
processDirectory(path.join(__dirname, 'src'));
console.log('Finished processing all files'); 
import { ApolloServer, gql } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import { GraphQLModule } from '@graphql-modules/core';

const InventoryModule = new GraphQLModule({
  typeDefs: gql`
    extend type Product @key(fields: "upc") {
      upc: String! @external
      weight: Int @external
      price: Int @external
      inStock: Boolean
      shippingEstimate: Int @requires(fields: "price weight")
    }
  `,
  resolvers: {
    Product: {
      __resolveReference(object) {
        return {
          ...object,
          ...inventory.find(product => product.upc === object.upc)
        };
      },
      shippingEstimate(object) {
        // free for expensive items
        if (object.price > 1000) return 0;
        // estimate is based on weight
        return object.weight * 0.5;
      }
    }
  }
});

const server = new ApolloServer({
  schema: buildFederatedSchema([InventoryModule])
});

server.listen({ port: 4004 }).then(({ url }) => {
  // tslint:disable-next-line: no-console
  console.log(`🚀 Server ready at ${url}`);
});

const inventory = [{ upc: '1', inStock: true }, { upc: '2', inStock: false }, { upc: '3', inStock: true }];

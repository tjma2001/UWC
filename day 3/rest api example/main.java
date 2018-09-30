public static void main() {
  Form form = new Form();
  form.add("x", "foo");
  form.add("y", "bar");

  ClientResource resource = new ClientResource("http://localhost:8080/someresource");

  Response response = resource.post(form.getWebRepresentation());

  if (response.getStatus().isSuccess()) {
      System.out.println("Success! " + response.getStatus());
      System.out.println(response.getEntity().getText());
  } else {
      System.out.println("ERROR! " + response.getStatus());
      System.out.println(response.getEntity().getText());
  }
}